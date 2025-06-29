# UseCases

## Login

Authenticate a user with email and password.

#### Request

**URL:** `/auth/login`  
**Method:** `POST`  
**Content-Type:** `application/json`

#### Example cURL

```bash
curl -X POST 'http://localhost:3000/auth/login' \
-H 'Content-Type: application/json' \
-d '{"email": "user@example.com", "password": "yourpassword"}'
```

## Refresh Token

Use this endpoint to refresh an access token.

#### Request

**URL:** `/auth/refreshToken`  
**Method:** `POST`  
**Authorization:** Bearer token required
**Content-Type:** `application/json`

#### Example cURL

```bash
curl -X POST 'http://localhost:3000/auth/refreshToken' \
-H 'Authorization: Bearer <your-refresh-token>' \
-H 'Content-Type: application/json' \
-d '{"refreshToken": "yourRefreshToken"}'
```

## Get Client by National ID

Retrieve client details by national ID.

#### Request

**URL:** `/auth/nationalId/:nationalId`  
**Method:** `GET`  
**Authorization:** Bearer token required

#### Example cURL

```bash
curl -X GET 'http://localhost:3000/auth/nationalId/12345678912345' \
-H 'Authorization: Bearer <your-access-token>'
```

## Create Client from Partner

Create a new client from partner information.

#### Request

**URL:** `/auth/createClientFromPartner`  
**Method:** `POST`  
**Authorization:** Bearer token required
**Content-Type:** `application/json`

#### Example cURL

```bash
curl -X POST 'http://localhost:3000/auth/createClientFromPartner' \
-H 'Authorization: Bearer <your-access-token>' \
-H 'Content-Type: application/json' \
-d '{
  "duePaymentHistory": "NO",
  "email": "email@test.com",
  "phone": "01000000000",
  "firstName": "string",
  "lastName": "string",
  "commercialName": "string",
  "startDate": "2024-11-13T09:21:11.056Z",
  "requestedLoanTenor": 0,
  "numberOfBranches": 1,
  "reputation": 3,
  "ownershipStatus": "owned",
  "location": "A",
  "productMixPercent": 100,
  "grossMarginPercent": 100,
  "partnerCoveragePercent": 100,
  "seasonalityEffect": true,
  "importedRawMaterialPercent": 100,
  "durationOfSameInventoryStorage": 0,
  "numberDistributionsPerMonth": 0,
  "inventoryDaysOnHand": 0,
  "receivablesDaysOnHand": 0,
  "payableDaysOnHand": 0,
  "personalIScore": "bad",
  "companyCreditCheck": "bad",
  "investments": 0,
  "liabilities": 0,
  "useOfProceeds": "inventory",
  "historicalLoansCount": 0,
  "partnerHistoricalLoansCount": 0,
  "yearsOfOperations": 0,
  "pastDuesCount": 0,
  "governorate": "string",
  "city": "string",
  "customFields": {
    "commercialRecord": "string",
    "establishmentDate": "string",
    "industry": "string"
  },
  "transactions": [
    {
      "timestamp": 1,
      "amount": 0
    }
  ],
  "paymentFrequency": {},
  "taxRecordId": "string"
  }'
```

## Create Simple Loan

Create a simple loan for a client.

#### Request

**URL:** `/auth/simple-loan`  
**Method:** `POST`  
**Authorization:** Bearer token required
**Content-Type:** `application/json`

#### Example cURL

```bash
curl -X POST 'http://localhost:3000/auth/simple-loan' \
-H 'Authorization: Bearer <your-access-token>' \
-H 'Content-Type: application/json' \
-d '{"loanAmount": 1000, "nationalId": "1234567891234"}'
```

## Webhook

Trigger a webhook to add user data.

#### Request

**URL:** `/auth/webhook`  
**Method:** `POST`  
**Authorization:** Bearer token required
**Content-Type:** `application/json`

#### Example cURL

```bash
curl -X POST 'http://localhost:3000/auth/webhook' \
-H 'Authorization: Bearer <your-access-token>' \
-H 'Content-Type: application/json' \
-d '{"url": 'http://example.com'}'
```

Webhook Body...

```
{
    clientId: number,
    commercialName: "string",
    loanLimit: number,
    disbursmentTime: Date,
}
```
