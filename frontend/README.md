# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Register a User Before Running the Program
Before launching the application, you **must** register at least one user account via the command line. The login page will not work without a registered user.
 
---
 
## Step 1: Start the Application
 
Make sure the application is running locally at `http://127.0.0.1:5000` before proceeding.
 
---
 
## Step 2: Register a User via CMD or PowerShell
 
Open **Command Prompt** or **PowerShell** and run the following command to register a user:
 
### PowerShell
 
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/register" -Method POST -ContentType "application/json" -Body '{"username": "admin", "password": "admin123", "role": "admin"}'
```
 
### CMD (using curl)
 
```cmd
curl -X POST "http://127.0.0.1:5000/register" -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"admin123\", \"role\": \"admin\"}"
```
 
---
 
## Registration Fields
 
| Field      | Description                                      | Example       |
|------------|--------------------------------------------------|---------------|
| `username` | The username for login                           | `admin`       |
| `password` | The password for login                           | `admin123`    |
| `role`     | The role assigned to the user (e.g. `admin`, `user`) | `admin`   |
 
---
 
## Example: Registering Multiple Users
 
You can register additional users with different roles by changing the field values:
 
```powershell
# Register a standard user
Invoke-RestMethod -Uri "http://127.0.0.1:5000/register" -Method POST -ContentType "application/json" -Body '{"username": "john", "password": "john123", "role": "user"}'
 
# Register another admin
Invoke-RestMethod -Uri "http://127.0.0.1:5000/register" -Method POST -ContentType "application/json" -Body '{"username": "superadmin", "password": "super123", "role": "admin"}'
```
 
---
 
## Step 3: Log In
 
Once a user has been registered, navigate to the login page in your browser:
 
```
http://127.0.0.1:5000
```
 
Use the `username` and `password` you registered with to log in.
 
---
 
## Notes
 
- Registration must be completed **each time** the database is reset or cleared.
- Passwords are stored securely — do not reuse sensitive passwords.
- The `role` field controls what the user has access to within the application.
