# Help

Some explanation about the technical part of this project in regard of usage.

# Models

## Creating a model

### Creating

To create a new model, navigate over to the `models/` folder within the project's source.

Here's a small snippet with the basics of creating a model:

```js
// Import the datatypes and the local
// sequelize instance from the project's
// source.
const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const User = sequelize.define(
  // Name of the table
  // Is automatically pluralized
  // (i.e "users")
  "user",
  {
    // Model attributes are defined here
    firstName: {
      // Type of firstName
      type: DataTypes.STRING,
      // Defaults to true
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
  },
  {
    // This will make the columns inside
    // of the database be snake_case, but
    // camelCase inside the code.
    underscored: true,
    // Other model options go here
  }
);

// Export the user so it can be imported
// in other files (i.e controllers)
module.exports = User;
```

This model can now be imported anywhere within the project, but should technically only be imported in the controllers.

### Convention

The convention we use for the file name is just the name of the model (singular), followed the file extension (.js).

### Documentation

For more help, head over to [Sequelize's documentation](https://sequelize.org/v6/manual/model-basics.html).

# Views

## Creating

To create a new view, navigate over to the `views/` folder within the project's source. As you can see there are two child folders: `pages/` and `partials/`. The pages folder is used for rendering entire pages. and the partials folder is used for shared components between those page views. You should see each file as a html page with extra syntax that can be used to modify that page.

## Partials

If you have a element in your view that is used multiple times, you can create a partial file.

You can include partials within pages using the following:

```js
<%- include("../../partials/head", {
    // Title that is parsed within the
    // <title> html tags within the
    // <head>
    title: "Title"
    // Optional data you can send
    // to the partial so it can be
    // parsed within that partial.
}) %>
```

Be aware that you don't always need a partial. Sometimes you can send an array of data to the view (i.e `orders`). And use a for each within the view.

## Convention

The convention we use for pages is simple. For every route (i.e `/dashboard`), we determine if it's a single page first. If it's a single page create a file named after that route (i.e `dashboard.ejs`). If there are subroutes that share the same dashboard layout, but have different content each time, create a folder (i.e `dashboard/`). Then create multiple files in there for each route (i.e `overview.ejs` and `orders.ejs`). The same convention follows for partials, but starting at the `partials/` folder.

### Documentation

For more help, head over to [EJS's documentation](https://ejs.co/#docs).

# Controllers

## Creating

TODO

## Convention

TODO

## Documentation

For more help, head over to [Express's documentation](http://expressjs.com/en/5x/api.html#router).
