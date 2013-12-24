# jquery-db

A HTML5 Client Side Database ORM for jQuery based on Hibernate

## Requirements

1. `JQuery 1.6+` or `JQuery 2.0.0+` (Recommend the [latest stable version](http://code.jquery.com/))

## Usage

	<script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
	<script src="https://raw.github.com/perrygeorget/jquery-db/master/dist/jquery.db.0.0.1.min.js"></script>
	
[Download the distribution](https://github.com/perrygeorget/jquery-db/tree/master/dist) and get started!
		
## Getting Started

All database operations happen asynchronously.

### Creating an Instance of a Database

	var db = $.db("people", "1.0", "People Database", 1024 * 1024);

1. Database name
2. Version number
3. Text description
4. Size of database

### Create Your First Table

	db.createTable({
        name: "person",
        columns: [
            "serial_number INTEGER PRIMARY KEY",
            "name TEXT",
            "rank TEXT",
        ],
        success: function () {
        	console.log("Yay!  My first table.");
        },
        failure: function () {
        	console.log("Something went wrong....");
        }
    });
    
Outputs:

	Yay!  My first table.
    
### List the Tables in Your Database

	db.tables(function(tables) {
		console.log(tables);
	});
	
Outputs:

	["person"]
	
### Adding a Record to Your Database

	db.insert("person", {
        data: {
            serial_number: 7779311,
            name: "Pepper",
            rank: "Sergeant"
        },
        success: function () {
        	console.log("Yay!  I created a person!");
        },
        failure: function () {
        	console.log("Something went wrong....");
        }
    });

Outputs:

	Yay!  I created a person!
    
### Selecting the Records of Your Database

	db.criteria("person").list(
        function (transaction, results) {
            var rows = results.rows;
            
			for (var i = 0; i < rows.length; i++) {
            	var row = rows.item(i);
            	console.log(row.rank + " " + row.name + " [" + row.serial_number + "]");
			}
        },
        function (transaction, error) {
        	console.log("Something went wrong....");
        }
    );
    
Outputs:

	Sergeant Pepper [7779311]

## Database

### Creating a Database

### Versioning a Database

## Tables

### Adding Tables

### Removing Tables

## Data

### Adding Data

### Selecting Data

### Updating Data

### Removing Data

### Filtering Data

## Contributing

## Release Notes

No releases as of yet.  This project is still in early development.