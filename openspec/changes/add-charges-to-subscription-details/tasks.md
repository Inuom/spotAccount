# Implementation Tasks

## 1. Frontend Store & Selectors
- [x] 1.1 Create selector `selectChargesBySubscriptionId` in charges selectors to filter charges by subscription ID
- [x] 1.2 Verify charges loading state selector works for displaying loading indicators

## 2. Subscription Details Component
- [x] 2.1 Import charges store selectors and models
- [x] 2.2 Add observable for charges filtered by current subscription ID
- [x] 2.3 Dispatch loadCharges action with subscription_id filter when component initializes
- [x] 2.4 Add charges display section to template after participants section
- [x] 2.5 Display charges in a card/list format with period, amount, status, and share count
- [x] 2.6 Add loading state handling for charges section
- [x] 2.7 Add empty state message when no charges exist
- [x] 2.8 Add styles for charges section matching existing component design

## 3. Testing
- [x] 3.1 Verify charges load when viewing subscription details
- [x] 3.2 Verify charges are filtered correctly by subscription ID
- [x] 3.3 Verify empty state displays when no charges exist
- [x] 3.4 Verify loading state displays while charges are being fetched

## 4. Documentation
- [x] 4.1 Update component documentation if needed
