# Step-and-Save API Documentation

## Overview

The Step-and-Save API provides endpoints for step tracking, coupon management, merchant services, and gasless meta-transactions on the VERY Network.

**Base URL:** `https://api.step-and-save.app` (Production) | `http://localhost:3001` (Development)

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- **Rate Limit:** 100 requests per 15 minutes per IP
- **Headers:** Rate limit info is returned in response headers

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error type",
  "message": "Human readable error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Authentication

#### POST /api/auth/connect
Authenticate with wallet signature.

**Request Body:**
```json
{
  "address": "0x742...",
  "signature": "0x123...",
  "message": "Sign this message to authenticate with Step-and-Save"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "address": "0x742...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Step Tracking

#### POST /api/steps/verify
Submit step count for verification with ZK proof.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "stepCount": 1500,
  "proofHash": "0xabc123...",
  "timestamp": 1704067200000,
  "location": {
    "latitude": 37.5172,
    "longitude": 127.0473,
    "accuracy": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "verificationId": "ver_123456",
  "totalSteps": 1500,
  "eligibleForCoupon": true,
  "geohash": "wydm6",
  "message": "Steps verified successfully"
}
```

#### GET /api/steps/history
Get user's step verification history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of records (default: 50, max: 100)
- `offset` (optional): Number of records to skip (default: 0)
- `from` (optional): Start date (ISO string)
- `to` (optional): End date (ISO string)

**Response:**
```json
{
  "history": [
    {
      "id": "ver_123456",
      "stepCount": 1500,
      "timestamp": 1704067200000,
      "geohash": "wydm6",
      "proofHash": "0xabc123...",
      "verified": true
    }
  ],
  "totalSteps": 15000,
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 25
  }
}
```

---

### Coupons

#### POST /api/coupons/mint
Mint a new step coupon NFT.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "location": {
    "latitude": 37.5172,
    "longitude": 127.0473,
    "accuracy": 10
  },
  "stepCount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0xdef456...",
  "tokenId": 42,
  "geohash": "wydm6",
  "expiryTimestamp": 1704672000000,
  "message": "Coupon minted successfully"
}
```

#### GET /api/coupons/my
Get user's owned coupons.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `expired`, `redeemed`)
- `limit` (optional): Number of records (default: 20)

**Response:**
```json
{
  "coupons": [
    {
      "tokenId": 42,
      "stepCount": 1000,
      "geohash": "wydm6",
      "mintTimestamp": 1704067200000,
      "expiryTimestamp": 1704672000000,
      "isRedeemed": false,
      "bids": [
        {
          "bidId": 15,
          "merchant": "0x789...",
          "amount": "5.0",
          "offerId": 8,
          "isAccepted": false
        }
      ]
    }
  ],
  "stats": {
    "total": 5,
    "active": 3,
    "expired": 1,
    "redeemed": 1
  }
}
```

#### GET /api/coupons/:tokenId
Get coupon details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "tokenId": 42,
  "owner": "0x742...",
  "stepCount": 1000,
  "geohash": "wydm6",
  "mintTimestamp": 1704067200000,
  "expiryTimestamp": 1704672000000,
  "isRedeemed": false,
  "isValid": true,
  "bids": [],
  "metadata": {
    "name": "Step-Coupon #42",
    "description": "1000 steps converted to savings",
    "image": "https://api.step-and-save.app/metadata/42/image"
  }
}
```

---

### Merchants

#### POST /api/merchants/register
Register as a merchant.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "ABC Cafe",
  "description": "Cozy coffee shop in Gangnam",
  "location": "123 Gangnam-daero, Seoul",
  "coordinates": {
    "latitude": 37.5172,
    "longitude": 127.0473
  },
  "businessHours": "09:00-22:00",
  "contactInfo": {
    "phone": "+82-10-1234-5678",
    "email": "hello@abccafe.com",
    "website": "https://abccafe.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "merchant": {
    "id": "merchant_123",
    "address": "0x789...",
    "name": "ABC Cafe",
    "geohash": "wydm6",
    "isActive": true,
    "registrationTimestamp": 1704067200000
  }
}
```

#### POST /api/merchants/offers
Create a new offer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "20% Off Coffee",
  "description": "Get 20% discount on all coffee drinks",
  "discountPercentage": 20,
  "maxDiscountAmount": "10.0",
  "minPurchaseAmount": "5.0",
  "validityDuration": 2592000,
  "maxRedemptions": 100,
  "applicableGeohash": "wydm6"
}
```

**Response:**
```json
{
  "success": true,
  "offerId": 8,
  "offer": {
    "offerId": 8,
    "merchant": "0x789...",
    "title": "20% Off Coffee",
    "discountPercentage": 20,
    "isActive": true,
    "validUntil": 1706659200000,
    "maxRedemptions": 100,
    "currentRedemptions": 0
  }
}
```

#### GET /api/merchants/offers
Get merchant's offers.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `expired`, `inactive`)
- `limit` (optional): Number of records (default: 20)

**Response:**
```json
{
  "offers": [
    {
      "offerId": 8,
      "title": "20% Off Coffee",
      "discountPercentage": 20,
      "maxDiscountAmount": "10.0",
      "isActive": true,
      "validUntil": 1706659200000,
      "maxRedemptions": 100,
      "currentRedemptions": 5
    }
  ],
  "stats": {
    "total": 3,
    "active": 2,
    "expired": 1
  }
}
```

#### POST /api/merchants/bids
Place a bid on a coupon.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "offerId": 8,
  "couponTokenId": 42,
  "couponOwner": "0x742...",
  "bidAmount": "5.0"
}
```

**Response:**
```json
{
  "success": true,
  "bidId": 15,
  "bid": {
    "bidId": 15,
    "offerId": 8,
    "couponTokenId": 42,
    "bidder": "0x789...",
    "couponOwner": "0x742...",
    "bidAmount": "5.0",
    "bidTimestamp": 1704067200000,
    "isAccepted": false
  }
}
```

---

### Relayer (Gasless Transactions)

#### POST /api/relayer/submit
Submit a meta-transaction for gasless execution.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "to": "0xContractAddress...",
  "data": "0xfunctionCallData...",
  "value": "0",
  "gasLimit": "100000",
  "signature": "0xsignature...",
  "from": "0x742..."
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0xtxhash...",
  "gasUsed": "85000",
  "blockNumber": 1234567,
  "relayerBalance": "9.8745"
}
```

#### GET /api/relayer/status/:txHash
Get transaction status.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "transactionHash": "0xtxhash...",
  "status": "confirmed",
  "blockNumber": 1234567,
  "gasUsed": "85000",
  "confirmations": 12
}
```

#### POST /api/relayer/estimate
Estimate relay fee for a transaction.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "to": "0xContractAddress...",
  "data": "0xfunctionCallData...",
  "value": "0"
}
```

**Response:**
```json
{
  "estimatedFee": "0.001500",
  "gasEstimate": "85000",
  "gasPrice": "20000000000"
}
```

---

### Redemption

#### POST /api/redemptions/redeem
Redeem a coupon (merchant endpoint).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "couponTokenId": 42,
  "bidId": 15,
  "originalAmount": "25.0",
  "transactionHash": "offline_tx_abc123",
  "verificationCode": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "redemptionId": "red_789",
  "discountAmount": "5.0",
  "finalAmount": "20.0",
  "feeAmount": "0.05",
  "timestamp": 1704067200000
}
```

#### GET /api/redemptions/history
Get redemption history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional): `merchant` or `customer`
- `limit` (optional): Number of records (default: 20)

**Response:**
```json
{
  "redemptions": [
    {
      "redemptionId": "red_789",
      "couponTokenId": 42,
      "merchant": "0x789...",
      "customer": "0x742...",
      "originalAmount": "25.0",
      "discountAmount": "5.0",
      "finalAmount": "20.0",
      "timestamp": 1704067200000,
      "isVerified": true
    }
  ],
  "stats": {
    "totalRedemptions": 25,
    "totalSavings": "125.50",
    "totalRevenue": "1255.00"
  }
}
```

---

## WebSocket Events

Connect to `/ws` for real-time updates.

### Events Sent to Client

#### `stepVerification`
```json
{
  "type": "stepVerification",
  "data": {
    "userId": "0x742...",
    "stepCount": 1500,
    "totalSteps": 15000,
    "canMintCoupon": true
  }
}
```

#### `newBid`
```json
{
  "type": "newBid",
  "data": {
    "bidId": 15,
    "couponTokenId": 42,
    "couponOwner": "0x742...",
    "merchant": "0x789...",
    "amount": "5.0"
  }
}
```

#### `couponRedeemed`
```json
{
  "type": "couponRedeemed",
  "data": {
    "redemptionId": "red_789",
    "couponTokenId": 42,
    "savings": "5.0"
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## SDKs

### JavaScript/TypeScript
```bash
npm install @step-and-save/sdk
```

```javascript
import { StepAndSaveSDK } from '@step-and-save/sdk';

const sdk = new StepAndSaveSDK({
  apiUrl: 'https://api.step-and-save.app',
  apiKey: 'your-api-key'
});

// Verify steps
await sdk.steps.verify({
  stepCount: 1500,
  location: { latitude: 37.5172, longitude: 127.0473 }
});
```

For more examples and detailed integration guides, visit our [Developer Documentation](https://docs.step-and-save.app).