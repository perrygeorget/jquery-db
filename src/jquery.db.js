/*global jQuery, console */

/**
 * See (http://jquery.com/).
 * @name jQuery
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See (http://jquery.com/)
 * @name db
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf jQuery
 */
(function (jQuery) {
    "use strict";

    /**
     * Simplified API for retrieving entities by composing a criterion via chaining.
     *
     * @name JQueryDatabaseCriteria
     *
     * @param {JQueryDatabase} db - The database object
     * @param {String} tableName - The name of the table where the criteria will be applied
     *
     * @constructor
     */
    function JQueryDatabaseCriteria(db, tableName) {
        this.db = db;
        this.tableName = tableName;

        this.maxResults = undefined;
        this.firstResult = 0;
        this.restrictions = [];
        this.order = [];
    }

    /**
     * Set a limit upon the number of objects to be retrieved.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {Number} count - The maximum number of records to be returned.
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.setMaxResults = function (count) {
        this.maxResults = count;
        return this;
    };

    /**
     * Set the first result to be retrieved.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {Number} offset - The number of rows to skip before returning rows.
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.setFirstResult = function (offset) {
        this.firstResult = offset;
        return this;
    };

    /**
     * Add an ordering to the result set.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {JQueryDatabaseOrder} order - A specification of the order of rows to be returned.
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.addOrder = function (order) {
        this.order.push(order);
        return this;
    };

    /**
     * Set the first result to be retrieved.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {JQueryDatabaseRestriction} restriction - A specification of data to be filtered.
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.add = function (restriction) {
        this.restrictions.push(restriction);

        return this;
    };

    /**
     * Selects records from the database.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {SQLStatementCallback|Function} [successCallback] - Handles completed queries
     * @param {SQLStatementErrorCallback|Function} [errorCallback] - Handles failed queries
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.list = function (successCallback, errorCallback) {
        var sql = "SELECT _ROWID_, * FROM " + this.tableName;
        this._executeCriteria(sql, undefined, successCallback, errorCallback);
        return this;
    };

    /**
     * Counts records in the database.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {SQLStatementCallback|Function} [successCallback] - Handles completed queries
     * @param {SQLStatementErrorCallback|Function} [errorCallback] - Handles failed queries
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.count = function (successCallback, errorCallback) {
        var sql = "SELECT COUNT(*) AS count FROM " + this.tableName;
        this._executeCriteria(sql, undefined, successCallback, errorCallback);
        return this;
    };

    /**
     * Updates records in the database.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {{}} data The data to be updated.
     * @param {SQLStatementCallback|Function} [successCallback] - The callback for completed queries.
     * @param {SQLStatementErrorCallback|Function} [errorCallback] - The callback for failed queries.
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.update = function (data, successCallback, errorCallback) {
        var values = [];
        var assignments = [];

        jQuery.each(data, function (index, obj) {
            values.push(obj);
            assignments.push(index + " = ?");
        });

        var sql = "UPDATE " + this.tableName + " SET " + assignments.join(",");
        this._executeCriteria(sql, values, successCallback, errorCallback);
        return this;
    };

    /**
     * Removes records from the database.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {SQLStatementCallback|Function} [successCallback] - The callback for completed queries.
     * @param {SQLStatementErrorCallback|Function} [errorCallback] - The callback for failed queries.
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.destroy = function (successCallback, errorCallback) {
        var sql = "DELETE FROM " + this.tableName;
        this._executeCriteria(sql, undefined,  successCallback, errorCallback);
        return this;
    };

    /**
     * Returns the where clause that is used when picking data to select or manipulate
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {Array} args - Array where arguments are contained.  (Will have values for where clause added to it.)
     * @returns {string} where - The where clause for the query.
     *
     * @protected
     */
    JQueryDatabaseCriteria.prototype._getWhereClause = function (args) {
        var where = [];
        jQuery.each(this.restrictions, function (index, obj) {
            where.push(obj.expr);
            var i;
            for (i = 0; i < obj.args.length; i = i + 1) {
                args.push(obj.args[i]);
            }
        });
        return where.join(" AND ");
    };

    /**
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {String} sql - The unfiltered unrestricted statement.
     * @param {Array} args - Arguments for the unfiltered unrestricted statement.
     * @param {SQLStatementCallback|Function} [successCallback] - The callback for completed queries.
     * @param {SQLStatementErrorCallback|Function} [errorCallback] - The callback for failed queries.
     *
     * @private
     */
    JQueryDatabaseCriteria.prototype._executeCriteria = function (sql, args, successCallback, errorCallback) {
        args = args || [];

        if (this.restrictions.length > 0) {
            var whereClause = this._getWhereClause(args);
            sql = sql + " WHERE " + whereClause;
        }
        if (this.order.length > 0) {
            jQuery.each(this.order, function (index, obj) {

            });
            sql = sql + " ORDER BY " + this.order.join(",");
        }
        if (typeof this.maxResults === "number") {
            sql = sql + " LIMIT " + this.maxResults;
        }
        if ((typeof this.firstResult === "number") && (this.firstResult > 0)) {
            sql = sql + " OFFSET " + this.firstResult;
        }

        var caller = function (tx) {
            tx.executeSql(sql, args, successCallback, errorCallback);
        };

        this.db.database.transaction(caller);
    };

    /**
     * Result set ordering
     *
     * @name JQueryDatabaseOrder
     *
     * @param {String} property - The column whose values will be used to order results of the query.
     * @param {Boolean} [isAscending] - Whether or not the values of the property will be ascending or descending.
     *
     * @constructor
     */
    function JQueryDatabaseOrder(property, isAscending) {
        JQueryDatabaseOrder.prototype.isAscending = true;

        this.property = property;
        if (isAscending !== undefined) {
            this.isAscending = isAscending;
        }
    }

    /**
     * String representation of the order by clause
     *
     * @function
     * @memberOf JQueryDatabaseOrder
     *
     * @returns {string}
     */
    JQueryDatabaseOrder.prototype.toString = function () {
        var order;
        if (this.isAscending) {
            order = "ASC";
        } else {
            order = "DESC";
        }

        return this.property + " " + order;
    };

    /**
     * Filters for database queries
     *
     * @name JQueryDatabaseRestriction
     *
     * @param {String} expr - An expression that defined a part of the where clause.
     * @param {Array} [args] - SQL arguments to be applied to this part of the where clause at query execution time.
     *
     * @constructor
     */
    function JQueryDatabaseRestriction(expr, args) {
        JQueryDatabaseRestriction.prototype.args = [];

        this.expr = expr;
        if (args !== undefined) {
            this.args = args;
        }
    }

    /**
     * Exception thrown for issues within this package.
     *
     * @name JQueryDatabaseException
     *
     * @param {String} message - The error message.
     *
     * @constructor
     */
    function JQueryDatabaseException(message) {
        JQueryDatabaseRestriction.prototype.message = "JQuery Database Exception";

        if (message !== undefined) {
            this.message = message;
        }
    }

    /**
     * String representation of the exception.
     *
     * @function
     * @memberOf JQueryDatabaseException
     *
     * @returns {String}
     */
    JQueryDatabaseException.prototype.toString = function () {
        return this.message;
    };


    /**
     * A connection to the database.
     *
     * @name JQueryDatabase
     *
     * @param {Database} database - The Web SQL database object.
     *
     * @constructor
     */
    function JQueryDatabase(database) {
        JQueryDatabase.prototype.migrations = {};

        this.restriction = jQuery.db.restriction;
        this.database = database;
    }

    /**
     * Adds migrations that are available to bump a database from one version to another.
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param oldVersion - The version of the database before execution of the migration.
     * @param newVersion - The version of the database when migration execution is complete.
     * @param {SQLTransactionCallback|Function} callback
     *
     * @return {JQueryDatabase}
     */
    JQueryDatabase.prototype.addVersionMigration = function (oldVersion, newVersion, callback) {
        if (!this.database.changeVersion) {
            throw new JQueryDatabaseException("Version changes not possible in this browser version.");
        }

        this.migrations[oldVersion + ":" + newVersion] = callback;

        return this;
    };

    /**
     * The current version of the database.
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @returns {string}
     */
    JQueryDatabase.prototype.getVersion = function () {
        return this.database.version;
    };

    /**
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param newVersion
     * @param {SQLVoidCallback|Function} [successCallback]
     * @param {SQLTransactionErrorCallback|Function} [errorCallback]
     *
     * @return {JQueryDatabase}
     */
    JQueryDatabase.prototype.changeVersion = function (newVersion, successCallback, errorCallback) {
        if (!this.database.changeVersion) {
            throw new JQueryDatabaseException("Version changes not possible in this browser version.");
        }

        var oldVersion = this.getVersion();
        var migrationKey = oldVersion + ":" + newVersion;

        if (!this.migrations.hasOwnProperty(migrationKey)) {
            throw new JQueryDatabaseException("Migration not found [" + oldVersion + " -> " + newVersion + "]");
        }

        var callback = this.migrations[migrationKey];
        this.database.changeVersion(oldVersion, newVersion, callback, errorCallback, successCallback);

        return this;
    };

    /**
     * Returns a list of tables
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {Function} callback
     *
     * @return {JQueryDatabase}
     */
    JQueryDatabase.prototype.tables = function (callback) {
        var mySuccessCallback = function (transaction, resultSet) {
            var tables = [];
            var i, len;
            len = resultSet.rows.length;
            for (i = 0; i < len; i = i + 1) {
                var item = resultSet.rows.item(i);
                tables.push(item.name);
            }

            if (typeof callback === "function") {
                callback(tables);
            }
        };

        var sql = "SELECT name FROM sqlite_master WHERE type = ?";

        var myErrorCallback = function (transaction, error) {
            throw new JQueryDatabaseException(error.message + " [" + error.code + "]");
        };

        this._execute(sql, ["table"], mySuccessCallback, myErrorCallback);

        return this;
    };

    /**
     * Specification for the column to be created.
     *
     * @typedef {Object} JQueryDatabase~CreateTableParamsColumns
     *
     * @property {String} name - The name of the column.
     * @property {String} [type] - The data type of the column.
     * @property {String} [constraint] - The constraints to be applied to the column.
     */

    /**
     * Parameters for table creation.
     *
     * @typedef {Object} JQueryDatabase~CreateTableParams
     *
     * @property {String} name - The name of the table.
     * @property {Array.<JQueryDatabase~CreateTableParamsColumns|String>} columns - The specifications for the columns to be created.
     * @property {String[]} [constraints] - The constraints to be applied to the table.
     * @property {String} [dropOrIgnore] - To drop or ignore existing tables.  (Must be one of "drop", "ignore" or undefined.)
     * @property {SQLStatementCallback|Function} [done] - The callback for completed table creation.
     * @property {SQLStatementErrorCallback|Function} [fail] - The callback for failed table creation.
     */

    /**
     * Creates a new table
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {JQueryDatabase~CreateTableParams} params - The parameters specifying the table to create and associated callbacks.
     *
     * @return {JQueryDatabase}
     */
    JQueryDatabase.prototype.createTable = function (params) {
        params = params || {};

        var tableName = params.name;
        var columnsAndConstraints = [];

        jQuery.each(params.columns, function (index, column) {
            if (typeof column === "object") {
                var columnAsString = column.name;

                if (column.hasOwnProperty("type")) {
                    columnAsString = columnAsString + " " + column.type;
                }

                if (column.hasOwnProperty("constraint")) {
                    columnAsString = columnAsString + " " + column.constraint;
                }

                columnsAndConstraints.push(columnAsString);
            } else {
                columnsAndConstraints.push(column);
            }
        });

        var dropOrIgnore;
        if (params.hasOwnProperty("dropOrIgnore")) {
            if (params.dropOrIgnore.toLowerCase() === "drop") {
                dropOrIgnore = "drop";
            } else if (params.dropOrIgnore.toLowerCase() === "ignore") {
                dropOrIgnore = "ignore";
            }
        }
        var successCallback;
        if (params.hasOwnProperty("done")) {
            successCallback = params.done;
        }
        var errorCallback;
        if (params.hasOwnProperty("fail")) {
            errorCallback = params.fail;
        }

        var sql = "CREATE TABLE ";

        if (dropOrIgnore === "ignore") {
            sql = sql + "IF NOT EXISTS ";
        }

        if (params.hasOwnProperty("constraints")) {
            jQuery.each(params.constraints, function (index, constraint) {
                columnsAndConstraints.push(constraint);
            });
        }

        sql = sql + tableName + " (" + columnsAndConstraints.join(",") + ")";

        if (dropOrIgnore === "drop") {
            this._execute("DROP TABLE IF EXISTS " + tableName, []);
        }

        this._execute(sql, [], successCallback, errorCallback);

        return this;
    };

    /**
     * Parameters for table removal.
     *
     * @typedef {Object} JQueryDatabase~DropTableParams
     *
     * @property {String} name - The name of the table.
     * @property {Boolean} [ignore] - Whether or not to ignore tables that do not exist.
     * @property {SQLStatementCallback|Function} [done] - The callback for completed table creation.
     * @property {SQLStatementErrorCallback|Function} [fail] - The callback for failed table creation.
     */

    /**
     * Drops an existing table
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {JQueryDatabase~DropTableParams} params - The parameters specifying the table to drop and associated callbacks.
     *
     * @returns {JQueryDatabase}
     */
    JQueryDatabase.prototype.dropTable = function (params) {
        params = params || {};

        var tableName = params.name;

        var ignore = params.hasOwnProperty("ignore") && params.ignore;

        var successCallback;
        if (params.hasOwnProperty("done")) {
            successCallback = params.done;
        }

        var errorCallback;
        if (params.hasOwnProperty("fail")) {
            errorCallback = params.fail;
        }

        var sql = "DROP TABLE ";

        if (ignore) {
            sql = sql + "IF EXISTS ";
        }

        sql = sql + tableName;

        this._execute(sql, [], successCallback, errorCallback);

        return this;
    };

    /**
     * Parameters for inserting data into a table.
     *
     * @typedef {Object} JQueryDatabase~InsertParams
     *
     * @property {{}} data - The data to be inserted into the database.
     * @property {SQLStatementCallback|Function} [successCallback] - The callback for completed queries.
     * @property {SQLStatementErrorCallback|Function} [errorCallback] - The callback for failed queries.
     */

    /**
     * Inserts a new row into a table
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {String} tableName - The name of the table where data will be inserted.
     * @param {JQueryDatabase~InsertParams} params - The parameters specifying the data to be inserted and associated callbacks.
     *
     * @returns {JQueryDatabase}
     */
    JQueryDatabase.prototype.insert = function (tableName, params) {
        var values = [];
        var columns = [];
        var placeholders = [];

        jQuery.each(params.data, function (index, obj) {
            placeholders.push("?");
            values.push(obj);
            columns.push(index);
        });

        var successCallback;
        if (params.hasOwnProperty("done")) {
            successCallback = params.done;
        }

        var errorCallback;
        if (params.hasOwnProperty("fail")) {
            errorCallback = params.fail;
        }

        var sql = "INSERT INTO " + tableName + " (" + columns.join(",") + ") VALUES (" + placeholders.join(",") + ")";

        this._execute(sql, values, successCallback, errorCallback);

        return this;
    };

    /**
     * This class is a simplified API for retrieving entities by composing a criterion via chaining.
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {String} tableName - The name of the table where data will be inserted.
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabase.prototype.criteria = function (tableName) {
        return new JQueryDatabaseCriteria(this, tableName);
    };

    /**
     * Executes a query on the database.
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {String} sql - The SQL statement.
     * @param {Array} [args] - Array of arguments for the SQL statement.
     * @param {SQLStatementCallback|Function} [successCallback] - The callback for completed queries.
     * @param {SQLStatementErrorCallback|Function} [errorCallback] - The callback for failed queries.
     * @private
     */
    JQueryDatabase.prototype._execute = function (sql, args, successCallback, errorCallback) {
        var caller = function (transaction) {
            args = args || [];
            transaction.executeSql(sql, args, successCallback, errorCallback);
        };

        this.database.transaction(caller);
    };

    /**
     * The creation callback will be called if the database is being created. Without this feature, however, the
     * databases are still being created on the fly and correctly versioned.
     *
     * @callback
     * @name JQueryDatabase_CreationCallback
     * @function
     *
     * @param {JQueryDatabase} db - A connection to the database.
     */

    /**
     * Creates an instance of the JQueryDatabase object.  Undefined is returned if HTML5 Web Database is not supported.
     *
     * @name db
     * @function
     * @memberOf jQuery
     *
     * @param {String} shortName - The database name
     * @param {String} version - The version number
     * @param {String} displayName - The text description
     * @param {Number} maxSize - The size of the database
     * @param {JQueryDatabase_CreationCallback} [creationCallback] - The creation callback will be called if the database is being created.
     *
     * @returns {undefined|JQueryDatabase}
     */
    jQuery.db = function (shortName, version, displayName, maxSize, creationCallback) {
        var db;
        if (!window.openDatabase) {
            db = undefined;
        } else {
            var openDB = window.openDatabase(shortName, version, displayName, maxSize, function (openDB) {
                if (typeof creationCallback !== "undefined") {
                    var db = new JQueryDatabase(openDB);
                    creationCallback(db);
                }
            });

            if (openDB) {
                db = new JQueryDatabase(openDB);
            } else {
                db = undefined;
            }
        }

        return db;
    };

    /**
     * Apply ordering by a property.
     *
     * @name db.order
     * @function
     * @memberOf jQuery
     *
     * @param {String} property - The column whose values will be used to order results of the query.
     * @param {Boolean} [isAscending] - Whether or not the values of the property will be ascending or descending.
     *
     * @return JQueryDatabaseOrder
     */
    jQuery.db.order = function (property, isAscending) {
        return new JQueryDatabaseOrder(property, isAscending);
    };

    jQuery.extend(jQuery.db.order, {
        /**
         * Ascending order
         *
         * @name db.order.asc
         * @function
         * @memberOf jQuery
         *
         * @param {String} property - The column whose values will be used to order results of the query.
         *
         * @returns {JQueryDatabaseOrder}
         */
        asc: function (property) {
            return jQuery.db.order(property, true);
        },

        /**
         * Descending order
         *
         * @name db.order.asc
         * @function
         * @memberOf jQuery
         *
         * @param {String} property - The column whose values will be used to order results of the query.
         * @returns {JQueryDatabaseOrder}
         */
        desc: function (property) {
            return jQuery.db.order(property, false);
        }
    });

    /**
     * Apply a constraint expressed in SQL.
     *
     * @name db.restriction
     * @function
     * @memberOf jQuery
     *
     * @param {String} expr - An expression that defined a part of the where clause.
     * @param {Array} args - SQL arguments to be applied to this part of the where clause at query execution time.
     *
     * @returns {JQueryDatabaseRestriction}
     */
    jQuery.db.restriction = function (expr, args) {
        return new JQueryDatabaseRestriction(expr, args);
    };

    jQuery.extend(jQuery.db.restriction, {
        /**
         * Apply an "equals" constraint to each property in the key set of an object
         *
         * @name db.restriction.allEq
         * @function
         * @memberOf jQuery
         *
         * @param {{}} object - A map from property names to values.
         *
         * @returns {JQueryDatabaseRestriction}
         */
        allEq: function (object) {
            var where = [];
            var values = [];
            jQuery.each(object, function (key, value) {
                where.push(key + " = ?");
                values.push(value);
            });
            return new JQueryDatabaseRestriction("(" + where.join(" AND ") + ")", values);
        },

        /**
         * Return the conjuction of two expressions
         *
         * @name db.restriction.and
         * @function
         * @memberOf jQuery
         *
         * @param {JQueryDatabaseCriteria} criteriaA
         * @param {JQueryDatabaseCriteria} criteriaB
         *
         * @returns {JQueryDatabaseRestriction}
         */
        and: function (criteriaA, criteriaB) {
            var args = [];
            var a = criteriaA._getWhereClause(args);
            var b = criteriaB._getWhereClause(args);
            return new JQueryDatabaseRestriction("(" + a + ") AND (" + b + ")", args);
        },

        /**
         * Apply a "between" constraint to the named property
         *
         * @name db.restriction.between
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} lowValue
         * @param {*} highValue
         *
         * @returns {JQueryDatabaseRestriction}
         */
        between: function (property, lowValue, highValue) {
            return new JQueryDatabaseRestriction(property + " BETWEEN ? AND ?", [lowValue, highValue]);
        },

        // conjunction: function() {},

        // disjunction: function() {}

        /**
         * Apply an "equal" constraint to the named property
         *
         * @name db.restriction.eq
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        eq: function (property, value) {
            return new JQueryDatabaseRestriction(property + " = ?", [value]);
        },

        /**
         * Apply an "equal" constraint to two properties
         *
         * @name db.restriction.eqProperty
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {String} otherProperty
         *
         * @returns {JQueryDatabaseRestriction}
         */
        eqProperty: function (property, otherProperty) {
            return new JQueryDatabaseRestriction(property + " = " + otherProperty);
        },

        /**
         * Apply a "greater than or equal" constraint to the named property
         *
         * @name db.restriction.ge
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        ge: function (property, value) {
            return new JQueryDatabaseRestriction(property + " >= ?", [value]);
        },

        /**
         * Apply a "greater than or equal" constraint to two properties
         *
         * @name db.restriction.geProperty
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {String} otherProperty
         *
         * @returns {JQueryDatabaseRestriction}
         */
        geProperty: function (property, otherProperty) {
            return new JQueryDatabaseRestriction(property + " >= " + otherProperty);
        },

        /**
         * Apply a "greater than" constraint to the named property
         *
         * @name db.restriction.gt
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        gt: function (property, value) {
            return new JQueryDatabaseRestriction(property + " > ?", [value]);
        },

        /**
         * Apply a "greater than" constraint to two properties
         *
         * @name db.restriction.gtProperty
         * @function
         * @memberOf jQuery
         *
         * @param property
         * @param {String} otherProperty
         *
         * @returns {JQueryDatabaseRestriction}
         */
        gtProperty: function (property, otherProperty) {
            return new JQueryDatabaseRestriction(property + " > " + otherProperty);
        },

        /**
         * Apply an "equal" constraint to the identifier property
         *
         * @name db.restriction.idEq
         * @function
         * @memberOf jQuery
         *
         * @param value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        idEq: function (value) {
            return new JQueryDatabaseRestriction("_ROWID_ = ?", [value]);
        },

        // See: http://www.sqlite.org/pragma.html#pragma_case_sensitive_like
        // Just use like for now.  LIKE *can* be made case sensitive, but is not for ASCII, but is for UTF-8.
        // ilike: function (property, value) {},

        /**
         * Apply an "in" constraint to the named property
         *
         * @name db.restriction.in
         * @function
         * @memberOf jQuery
         *
         * @param property
         * @param values
         *
         * @returns {JQueryDatabaseRestriction}
         */
        "in": function (property, values) {
            var placeholders = [];
            jQuery.each(values, function () {
                placeholders.push("?");
            });

            return new JQueryDatabaseRestriction(property + " in (" + placeholders.join(", ") + ")", values);
        },

        /**
         * Constrain a collection valued property to be empty
         *
         * @name db.restriction.isEmpty
         * @function
         * @memberOf jQuery
         *
         * @param property
         *
         * @returns {JQueryDatabaseRestriction}
         */
        isEmpty: function (property) {
            return new JQueryDatabaseRestriction("(" + property + " IS NULL OR " + property + " = '')");
        },

        /**
         * Constrain a collection valued property to be non-empty
         *
         * @name db.restriction.isNotEmpty
         * @function
         * @memberOf jQuery
         *
         * @param property
         *
         * @returns {JQueryDatabaseRestriction}
         */
        isNotEmpty: function (property) {
            return new JQueryDatabaseRestriction("(" + property + " IS NOT NULL AND " + property + " != '')");
        },

        /**
         *  Apply an "is not null" constraint to the named property
         *
         * @name db.restriction.isNotNull
         * @function
         * @memberOf jQuery
         *
         * @param property
         *
         * @returns {JQueryDatabaseRestriction}
         */
        isNotNull: function (property) {
            return new JQueryDatabaseRestriction(property + " IS NOT NULL");
        },

        /**
         * Apply an "is null" constraint to the named property
         *
         * @name db.restriction.isNull
         * @function
         * @memberOf jQuery
         *
         * @param property
         *
         * @returns {JQueryDatabaseRestriction}
         */
        isNull: function (property) {
            return new JQueryDatabaseRestriction(property + " IS NULL");
        },

        /**
         * Apply a "less than or equal" constraint to the named property
         *
         * @name db.restriction.le
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        le: function (property, value) {
            return new JQueryDatabaseRestriction(property + " <= ?", [value]);
        },

        /**
         * Apply a "less than or equal" constraint to two properties
         *
         * @name db.restriction.leProperty
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {String} otherProperty
         *
         * @returns {JQueryDatabaseRestriction}
         */
        leProperty: function (property, otherProperty) {
            return new JQueryDatabaseRestriction(property + " <= " + otherProperty);
        },

        /**
         * Apply a "like" constraint to the named property
         *
         * @name db.restriction.like
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        like: function (property, value) {
            return new JQueryDatabaseRestriction(property + " LIKE ?", [value]);
        },

        /**
         * Apply a "greater than" constraint to the named property
         *
         * @name db.restriction.lt
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        lt: function (property, value) {
            return new JQueryDatabaseRestriction(property + " < ?", [value]);
        },

        /**
         * Apply a "greater than" constraint to two properties
         *
         * @name db.restriction.ltProperty
         * @function
         * @memberOf jQuery
         *
         * @param property
         * @param {String} otherProperty
         *
         * @returns {JQueryDatabaseRestriction}
         */
        ltProperty: function (property, otherProperty) {
            return new JQueryDatabaseRestriction(property + " < " + otherProperty);
        },

        /**
         * Apply a "not equal" constraint to the named property
         *
         * @name db.restriction.ne
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @param {*} value
         *
         * @returns {JQueryDatabaseRestriction}
         */
        ne: function (property, value) {
            return new JQueryDatabaseRestriction(property + " != ?", [value]);
        },

        /**
         * Apply a "not equal" constraint to two properties
         *
         * @name db.restriction.neProperty
         * @function
         * @memberOf jQuery
         *
         * @param property
         * @param {String} otherProperty
         *
         * @returns {JQueryDatabaseRestriction}
         */
        neProperty: function (property, otherProperty) {
            return new JQueryDatabaseRestriction(property + " != " + otherProperty);
        },

        /**
         * Return the negation of an expression
         *
         * @name db.restriction.not
         * @function
         * @memberOf jQuery
         *
         * @param {JQueryDatabaseCriteria} criteria
         *
         * @returns {JQueryDatabaseRestriction}
         */
        not: function (criteria) {
            var args = [];
            var where = criteria._getWhereClause(args);
            return new JQueryDatabaseRestriction("NOT (" + where + ")", args);
        },

        /**
         * Return the disjuction of two expressions
         *
         * @name db.restriction.or
         * @function
         * @memberOf jQuery
         *
         * @param {JQueryDatabaseCriteria} criteriaA
         * @param {JQueryDatabaseCriteria} criteriaB
         *
         * @returns {JQueryDatabaseRestriction}
         */
        or: function (criteriaA, criteriaB) {
            var args = [];
            var a = criteriaA._getWhereClause(args);
            var b = criteriaB._getWhereClause(args);
            return new JQueryDatabaseRestriction("(" + a + ") OR (" + b + ")", args);
        }
    });
}(jQuery));