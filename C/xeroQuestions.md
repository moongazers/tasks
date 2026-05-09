Based on the Xero API documentation, here are the recommended approaches for each scenario:

C1. How would you prove that our Xero API connection is working before checking invoices?
-------------------------------------------------------------

### 1\. Confirm the connection exists and get a `tenantId`

```http
GET https://api.xero.com/connections
Authorization: "Bearer " + access_token
```
-   What it proves\
    A `200 OK` response with a non‑empty array confirms that:

    -   Access token is valid (not expired or revoked).

    -   The user has authorised the app to access at least one tenant.

    -   A `tenantId` to use in every subsequent Accounting API call.

-   Look for\
    An object with `"tenantType": "ORGANISATION"` (or the tenant type expect to invoice).\
    Save the `tenantId` from that object.

> Source: "Check the tenants you're authorised to access" in the Managing Connections page.

* * * * *

### 2\. Verify the organisation is active and accessible

```http
GET https://api.xero.com/api.xro/2.0/Organisation
Authorization: "Bearer " + access_token
Xero-tenant-id: <tenantId from step 1>
```

-   What it proves\
    The response returns the full organisation record. Most importantly, check:

    -   `OrganisationStatus`: must be `"ACTIVE"`. A different status means the org cannot be accessed via the API.

    -   `OrganisationID`, `Name`, `LegalName`, etc. -- confirms talking to the right tenant.

> Source: "GET Organisation" section in the Organisation API page.

* * * * *

### 3\. Check the app's invoice‑specific permissions

http

GET https://api.xero.com/api.xro/2.0/Organisation/Actions
Authorization: "Bearer " + access_token
Xero-tenant-id: <tenantId>

-   What it proves\
    This endpoint returns a list of actions and their status (`ALLOWED` or `NOT-ALLOWED`) for the connected organisation. Before attempting to retrieve invoices, verify that the following actions are present and allowed:

    -   `"ViewInvoices"` -- essential for `GET /Invoices`

    -   Other relevant actions like `"CreateDraftInvoice"`, `"CreateApprovedInvoice"`, `"VoidInvoice"`, etc., depending on integration.

    If `"ViewInvoices"` is `NOT-ALLOWED`, calling `GET /Invoices` will fail -- regardless of a successful connection.

> Source: "GET Organisation Actions" section in the Organisation API page.

* * * * *

### Why these three steps are sufficient

| Step | Endpoint | Confirms |
| --- | --- | --- |
| 1 | `GET /connections` | Valid token, authorised tenant exists |
| 2 | `GET /Organisation` | Tenant is active and reachable |
| 3 | `GET /Organisation/Actions` | View invoices in that tenant |

Only after all three return the expected results should we proceed to `GET /Invoices`. This sequence avoids wasted calls and catches permission issues early -- most notably the case where a connection exists but the user's Xero plan does not include invoicing, or the user lost permission to view invoices.

C2. If /connections works but GET /Invoices fails, what would you check?
--------------------------------------------------

### 1\. Verify the correct `Xero-tenant-id` header

-   Every Accounting API call requires a valid `xero-tenant-id` header containing the `tenantId` of the organisation we want to access.

-   Confirm that the `tenantId` sending comes from a connection object in the `/connections` response that has `"tenantType": "ORGANISATION"`.\
    *(Managing Connections page shows the `tenantType` field; using a non‑ORGANISATION tenant (e.g. `PRACTICEMANAGER`) will cause the call to fail.)*

### 2\. Confirm the organisation is active and reachable

```http
GET /api.xro/2.0/Organisation
```

-   Check that `OrganisationStatus` is `"ACTIVE"`.

-   If the status is anything else (or the call fails), the tenant is not available for API operations.\
    *(Organisation API documentation)*

### 3\. Verify the app has the `ViewInvoices` permission

```http
GET /api.xro/2.0/Organisation/Actions
```

-   In the response, locate the action `"ViewInvoices"` and ensure its `Status` is `"ALLOWED"`.

-   If it is `"NOT-ALLOWED"`, the connected user's Xero plan or permissions do not permit reading invoices, regardless of the OAuth scopes.\
    *(Organisation API -- GET Organisation Actions; Invoices page also advises: "Be sure to check Organisation Actions to verify you can create invoices for the user.")*

### 4\. Inspect the OAuth scopes on the access token

-   Even though `/connections` succeeded, the token may have been issued with scopes that don't include `accounting.transactions.read`.

-   Decode the access token (e.g. using `jwt.io`) and confirm the `scope` claim contains the necessary Accounting API scope.

### 5\. Validate the request query parameters

-   The Invoices API page warns:

    > *Requests that have more than 100k invoices being returned in the response will be denied*\
    > *Requests using unoptimised fields for filtering or ordering that result in more than 100k invoices will be denied with a 400 response code*

-   If we are using a `where` filter or `order` parameter, ensure:

    -   Only using optimised fields for filtering: `Status`, `Contact.ContactID`, `Contact.Name`, `Contact.ContactNumber`, `Reference`, `InvoiceNumber`, `InvoiceId`, `Date`, `Type`, `AmountDue`, `AmountPaid`, `DueDate`.

    -   Only ordering by optimised fields: `InvoiceId`, `UpdatedDateUTC`, `Date`.

    -   Range operators are used correctly (e.g. `where=Date>=DateTime(2020,01,01) AND Date<DateTime(2020,02,01)`).

-   Quick test: Remove all query parameters and call the bare `GET /Invoices` endpoint. If it succeeds, the problem is in the query syntax.

### 6\. Use paging to avoid high‑volume rejections

-   The documentation recommends paging, and when querying with the `page` parameter, line‑item details are returned and the request is far less likely to hit the high‑volume threshold.

    ```http
    GET /api.xro/2.0/Invoices?page=1
    ```

-   If the unpaginated call fails but the paged call works, implement paging (default page size is 100 invoices).

### 7\. Try retrieving a single known invoice

-   If `GET /Invoices` fails but fetching an individual invoice works, the issue is definitely related to the volume or complexity of the collection query.

    ```http
    GET /api.xro/2.0/Invoices/{InvoiceID}
    ```

-   A successful single‑invoice call also confirms that the tenant, permissions, and token are all correct.

### 8\. Check for rate‑limiting headers

-   Even if the response does not explicitly say `429`, check the HTTP headers `X-DayLimit-Remaining`, `X-MinLimit-Remaining`, and `X-AppMinLimit-Remaining`.

-   If any are `0`, limit is hit. Wait and retry after the period resets.

* * * * *

### Quick diagnostic flow

1.  `GET /Organisation/Actions` → is `ViewInvoices` ALLOWED?

2.  `GET /Organisation` → is `OrganisationStatus` ACTIVE?

3.  `GET /Invoices/{InvoiceID}` (a known ID) → does the single record work?

4.  `GET /Invoices?page=1` → does paging work?

5.  If all of the above work, the problem is in the original query (unoptimised filter, missing paging, or syntax).

C3. What endpoint would you call to check invoices?
-----------------------------------------

The endpoint to call is:

```http
GET https://api.xero.com/api.xro/2.0/Invoices
```

No query parameters are mandatory --- the bare call returns invoices (summary-only for multiple results). The only required details beyond the endpoint itself are:

-   `Authorization` header -- a valid OAuth 2.0 access token (`Bearer ...`)

-   `Xero-tenant-id` header -- the tenant ID (from `GET /connections`) specifying which organisation to query

All filters (`Statuses`, `where`, `page`, etc.) are optional and can be used to narrow or paginate the result set.

C4. How would you check one specific invoice?
---------------------------------

To retrieve a single invoice, append its InvoiceID (UUID) or InvoiceNumber (e.g. `"INV-001"`) to the Invoices endpoint.

```http
GET https://api.xero.com/api.xro/2.0/Invoices/{identifier}
```

Example (InvoiceID)

```http
GET https://api.xero.com/api.xro/2.0/Invoices/243216c5-369e-4056-ac67-05388f86dc81
Authorization: Bearer <access_token>
Xero-tenant-id: <tenant_id>
```

Example (InvoiceNumber)

```http
GET https://api.xero.com/api.xro/2.0/Invoices/INV-00546
```

-   The response contains the full invoice object, including line items, contact details, payments, and status.

-   For sales invoices (`Type: ACCREC`) that are not in `DRAFT` status, the online invoice URL can be obtained with:

    ```http
    GET /api.xro/2.0/Invoices/{InvoiceID}/OnlineInvoice
    ```
-   An invoice can also be returned as a PDF via the `Accept: application/pdf` header, as mentioned in the Invoices documentation.

C5. If the invoice API returns 429, how should the backend handle it?
-----------------------------------------------

A `429` response from the invoice endpoint indicates the rate limit has been exceeded. The backend must handle it as follows:

1.  Read the `X-Rate-Limit-Problem` header\
    This header explains which limit was breached (e.g., `"minute"`, `"day"`, or `"appminute"`). The corrective action depends on the type of limit reached.

2.  Observe the `Retry-After` header\
    For minute‑limit and daily‑limit breaches, the response includes a `Retry-After` header specifying the number of seconds to wait before the next request will be accepted. The backend must suspend all further calls to that tenant until that interval has passed.

3.  Suspend requests and implement a wait/backoff mechanism

    -   Use the `Retry-After` value as the minimum wait time.

    -   If no `Retry-After` header is present, apply exponential backoff starting with a modest delay (e.g., 1 second) and doubling on each subsequent `429`.

    -   For daily limit breaches, the wait may be substantial (up to the remaining time in the 24‑hour window). Queueing or persisting pending requests for later execution is advisable.

4.  Monitor limit‑consumption headers proactively\
    Every response carries `X-DayLimit-Remaining`, `X-MinLimit-Remaining`, and `X-AppMinLimit-Remaining`. When these approach zero, the backend should voluntarily reduce request frequency before receiving a `429`. This prevents lock‑outs and maintains data freshness.

5.  Reduce polling‑induced consumption\
    Polling is a primary cause of daily‑limit exhaustion. To avoid repeated `429` errors:

    -   Replace polling with webhooks for invoice events (create, update, delete).

    -   If polling cannot be eliminated, increase the interval substantially (e.g., poll only for changed records using `If-Modified-Since` and infrequent cycles).