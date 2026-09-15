# Mismatch ALGORITHMS

## 1. Default Doctors Seeding

```python
def seed_default_doctors():
    if Doctor.query.count() == 0:
        Database.session.add_all([
            Doctor(
                doctor_first_name="Leanne",
                doctor_last_name="Walker"
            ),
            Doctor(
                doctor_first_name="Sanjay",
                doctor_last_name="Patel"
            ),
            Doctor(
                doctor_first_name="Aisha",
                doctor_last_name="Khan"
            ),
            Doctor(
                doctor_first_name="John",
                doctor_last_name="Doe"
            ),
            Doctor(
                doctor_first_name="Emma",
                doctor_last_name="Brown"
            ),
        ])

        Database.session.commit()


seed_default_doctors()
```

---

## 2. Booking and Lab Report Table

```jsx
<table border="1" cellPadding="10">
  <thead>
    <tr>
      <th>Booking ID</th>
      <th>Patient</th>
      <th>Doctor</th>
      <th>Lab Report</th>
    </tr>
  </thead>

  <tbody>
    {bookings.map((booking) => {
      const labRecord = labResults.find(
        (lab) =>
          lab.patient_first_name === booking.first_name &&
          lab.patient_last_name === booking.last_name
      );

      return (
        <tr key={booking.booking_id || booking.id}>
          <td>
            {booking.booking_id || booking.id}
          </td>

          <td>
            {booking.first_name} {booking.last_name}
          </td>

          <td>
            {booking.doctor_name}
          </td>

          <td>
            {labRecord ? (
              <>
                <Document
                  file={`http://127.0.0.1:5000/lab_reports/${labRecord.result}`}
                  onLoadError={(err) => console.log(err)}
                >
                  <Page
                    pageNumber={1}
                    width={200}
                  />
                </Document>

                <br />

                <a
                  href={`http://127.0.0.1:5000/lab_reports/${labRecord.result}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open PDF
                </a>
              </>
            ) : (
              "No PDF"
            )}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

