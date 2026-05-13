# Frontend & Backend Integrity Fixes

After a thorough review of both the React frontend and the Flask backend, I have discovered multiple severe mismatch errors that prevent the application from working. The frontend and backend have entirely different ideas about API endpoints, JSON payload keys, and response structures.

Here is the plan to fix all of these integrity problems to make the application fully functional.

## Proposed Changes

### 1. `booking_history.jsx` (Frontend)
- **Endpoint Mismatch:** The frontend currently makes a `GET` request to `/bookings`, but the backend defines the route as `/booking/all_bookings`.
- **Response Mismatch:** The frontend expects the backend to return an object like `{ bookings: [...] }`, but the backend returns an array directly `[...]`.
- **Action:** I will update the URL to `/booking/all_bookings` and change the data parsing logic to properly set the state using the returned array.

### 2. `booking_patient.jsx` (Frontend)
- **Endpoint Mismatch:** The frontend posts to `/bookings/add_booking`, but the backend is listening on `/booking/add_booking` (singular `booking`).
- **Payload Mismatch:** The frontend form state uses the key `patientNIC`, but the backend looks for `patientID`.
- **Action:** I will update the URL and map `patientNIC` to `patientID` when sending the JSON payload to the backend.

### 3. `all_patient.jsx` (Frontend)
- **Undefined Data Mapping:** The frontend tries to render `{p.first_name}`, `{p.last_name}`, and `{p.Tel_no}`. However, the backend sends `{ firstName, lastName, telephone }`. This causes all patients to render as "undefined undefined".
- **Wrong Primary Key:** The frontend attempts to use `p.id` as the React component key and for deletion. The `Patient` model doesn't have an `id` field; its primary key is `NIC`.
- **Action:** I will update the frontend to use the correct keys (`p.firstName`, `p.lastName`, `p.telephone`, `p.NIC`).

### 4. `add_patient.jsx` (Frontend)
- **Payload Mismatch:** The frontend submits keys `first_name`, `last_name`, and `Tel_no`, but the backend explicitly checks for `firstName`, `lastName`, and `telephone`.
- **Action:** I will update the frontend payload structure to exactly match what the backend expects.

### 5. `Login.jsx` (Frontend) & `main.py` (Backend)
- **Login Crash:** When a user logs in, the frontend attempts to read `data.user.role` and `data.user.username` to store in `localStorage`. However, the backend only returns `{ "message": "...", "role": "..." }`. The missing `user` object causes the React app to crash with a `TypeError`.
- **Action:** I will update the `/login` route in `main.py` to return a `user` object containing the `role` and `username`.

### 6. `main.py` (Backend)
- **Missing Delete Route:** The frontend expects a `DELETE /patient/delete/<id>` route to remove patients, but this route doesn't exist in the backend. 
- **Action:** I will implement the missing `@Application.route('/patient/delete/<nic>', methods=['DELETE'])` endpoint in `main.py` so the delete functionality actually works.

## User Review Required

> [!IMPORTANT]
> These changes are absolutely critical for your frontend and backend to talk to each other. Without them, forms will fail to submit, tables will be empty or show `undefined`, and logging in will crash the app.
> 
> Once you approve this plan, I will quickly execute these fixes so your application works end-to-end!
