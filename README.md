## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

To get started, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/m-mohammad-d/azogeh.git
   ```

2. Navigate into the project directory:

   ```bash
   cd azogeh
   ```

3. Install the backend dependencies:

   ```bash
   npm install
   ```

4. Install the client dependencies:

   ```bash
   npm install --prefix client
   ```

5. Create `.env` file in root of this project, and ask me for more details...🙂

## Usage

### Development

To start the development server, run:

```bash
npm run start:dev
```

> This command will run both the server and the client concurrently.

Now, navigate into `client` directory, and develop your project
👌🏻

### Data Seeding

#### CMS

- Open this address in your browser `http:localhost:3000/server` and create your sample data.

#### In one-go

- To import sample data into the database, follow these steps:

1. Navigate into this directory: `src/data`, and find this file: `products.ts`, now create your sample data.

2. After creating your data, in root directory of this project run these command:

```bash
npm run data:import
```

To destroy the seeded data, run:

```bash
npm run data:destroy
```
