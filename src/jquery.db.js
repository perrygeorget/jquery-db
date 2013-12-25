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
     * Simplified API for retrieving entities by composing a criterion via chaining
     *
     * @name JQueryDatabaseCriteria
     *
     * @param {JQueryDatabase} db
     * @param {String} tableName
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
     * @param {Number} count
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
     * @param {Number} offset
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
     * @param {JQueryDatabaseOrder} order
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
     * @param {JQueryDatabaseRestriction} restriction
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
     * @param {SQLStatementCallback} successCallback Handles completed queries
     * @param {SQLStatementErrorCallback} errorCallback Handles failed queries
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.list = function (successCallback, errorCallback) {
        var sql = "SELECT _ROWID_, * FROM " + this.tableName;
        this._executeCriteria(sql, successCallback, errorCallback);
        return this;
    };

    /**
     * Counts records in the database.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {SQLStatementCallback} successCallback Handles completed queries
     * @param {SQLStatementErrorCallback} errorCallback Handles failed queries
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.count = function (successCallback, errorCallback) {
        var sql = "SELECT COUNT(*) AS count FROM " + this.tableName;
        this._executeCriteria(sql, successCallback, errorCallback);
        return this;
    };

    /**
     * Removed records from the database.
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {SQLStatementCallback} successCallback Handles completed queries
     * @param {SQLStatementErrorCallback} errorCallback Handles failed queries
     *
     * @returns {JQueryDatabaseCriteria}
     */
    JQueryDatabaseCriteria.prototype.remove = function (successCallback, errorCallback) {
        var sql = "DELETE FROM " + this.tableName;
        this._executeCriteria(sql, successCallback, errorCallback);
        return this;
    };

    /**
     * Returns the where clause that is used when picking data to select or manipulate
     *
     * @function
     * @memberOf JQueryDatabaseCriteria
     *
     * @param {Array} args
     * @returns {string} where clause
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
     * @param {String} sql the unfiltered unrestricted statement
     * @param {SQLStatementCallback} successCallback Handles completed queries
     * @param {SQLStatementErrorCallback} errorCallback Handles failed queries
     *
     * @private
     */
    JQueryDatabaseCriteria.prototype._executeCriteria = function (sql, successCallback, errorCallback) {
        var args = [];

        if (this.restrictions.length > 0) {
            var whereClause = this._getWhereClause(args);
            sql = sql + " WHERE " + whereClause;
        }
        if (this.order.length > 0) {
            var order = [];
            jQuery.each(this.order, function (index, obj) {

            });
            sql = sql + " ORDER BY " + this.order.join(",");
        }
        if (typeof this.maxResults === "Number") {
            sql = sql + " LIMIT " + this.maxResults;
        }
        if (this.firstResult > 0) {
            sql = sql + " OFFSET " + this.firstResult;
        }

        var myCallback = function (transaction, resultSet) {
            if (successCallback !== undefined) {
                successCallback(transaction, resultSet);
            }
        };

        var myErrorCallback = function (transaction, error) {
            if (errorCallback !== undefined) {
                errorCallback(transaction, error);
            }
        };

        var caller = function (tx) {
            tx.executeSql(sql, args, myCallback, myErrorCallback);
        };

        this.db.database.transaction(caller);
    };

    /**
     * Result set ordering
     *
     * @name JQueryDatabaseOrder
     *
     * @param {String} property
     * @param {Boolean} [isAscending]
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
     * @param {String} expr
     * @param {Array} [args]
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
     * @param {String} message
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
     * @param {Database} database
     *
     * @constructor
     */
    function JQueryDatabase(database) {
        this.restriction = jQuery.db.restriction;

        this.database = database;
    }


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
                if (item.name !== "__WebKitDatabaseInfoTable__" && item.name !== "sqlite_sequence") {
                    tables.push(item.name);
                }
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
     * Creates a new table
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {{name: String, columns: Array<{name: String, type: String, constraint: String}>, constraints: Array<String>, dropOrIgnore: String, success: SQLStatementCallback, error: SQLStatementErrorCallback}} params
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
        if (params.hasOwnProperty("success")) {
            successCallback = params.success;
        }
        var errorCallback;
        if (params.hasOwnProperty("error")) {
            errorCallback = params.error;
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
     * Drops an existing table
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {{name: String, ignore: Boolean, success: Function, error: Function}} params
     *
     * @returns {JQueryDatabase}
     */
    JQueryDatabase.prototype.dropTable = function (params) {
        params = params || {};

        var tableName = params.name;

        var ignore = params.hasOwnProperty("ignore") && params.ignore;

        var successCallback;
        if (params.hasOwnProperty("success")) {
            successCallback = params.success;
        }

        var errorCallback;
        if (params.hasOwnProperty("error")) {
            errorCallback = params.error;
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
     * Inserts a new row into a table
     *
     * @function
     * @memberOf JQueryDatabase
     *
     * @param {String} tableName
     * @param {{data: {}, success: SQLStatementCallback, error: SQLStatementErrorCallback}} params
     *
     * @returns {JQueryDatabase}
     */
    JQueryDatabase.prototype.insert = function (tableName, params) {
        params = params || {};

        var values = [];
        var columns = [];
        var placeholders = [];

        jQuery.each(params.data, function (index, obj) {
            placeholders.push("?");
            values.push(obj);
            columns.push(index);
        });

        var successCallback;
        if (params.hasOwnProperty("success")) {
            successCallback = params.success;
        }

        var errorCallback;
        if (params.hasOwnProperty("error")) {
            errorCallback = params.error;
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
     * @param {String} tableName
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
     * @param {String} sql
     * @param {Array} [args]
     * @param {SQLStatementCallback} [callback]
     * @param {SQLStatementErrorCallback} [errorCallback]
     * @private
     */
    JQueryDatabase.prototype._execute = function (sql, args, callback, errorCallback) {
        var myCallback = function (transaction, resultSet) {
            if (callback !== undefined) {
                callback(transaction, resultSet);
            }
        };

        var myErrorCallback = function (transaction, error) {
            if (errorCallback !== undefined) {
                errorCallback(transaction, error);
            }
        };

        var caller = function (tx) {
            args = args || [];
            tx.executeSql(sql, args, myCallback, myErrorCallback);
        };

        this.database.transaction(caller);
    };

    /**
     *
     * @name db
     * @function
     * @memberOf jQuery

     * @param {String} shortName
     * @param {String} version
     * @param {String} displayName
     * @param {Number} maxSize
     * @param {DatabaseCallback} [creationCallback]
     *
     * @returns {undefined|JQueryDatabase}
     */
    jQuery.db = function (shortName, version, displayName, maxSize, creationCallback) {
        var db;
        if (!window.openDatabase) {
            db = undefined;
        } else {
            var openDB = window.openDatabase(shortName, version, displayName, maxSize, creationCallback);
            if (openDB) {
                db = new JQueryDatabase(openDB);
            } else {
                if (window.console) {
                    // console.log("HTML5 DB Unavailable");
                }
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
     * @param {String} property
     * @param {Boolean} isAscending
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
         * @param {String} property
         * @returns {JQueryDatabaseOrder}
         */
        asc: function (property) {
            return jQuery.db.order(property, "ASC");
        },

        /**
         * Descending order
         *
         * @name db.order.asc
         * @function
         * @memberOf jQuery
         *
         * @param {String} property
         * @returns {JQueryDatabaseOrder}
         */
        desc: function (property) {
            return jQuery.db.order(property, "DESC");
        }
    });

    /**
     * Apply a constraint expressed in SQL.
     *
     * @name db.restriction
     * @function
     * @memberOf jQuery
     *
     * @param {String} expr
     * @param {Array} args
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
         * @param object
         * @returns {JQueryDatabaseRestriction}
         */
        allEq: function (object) {
            var where = [];
            var values = [];
            jQuery.each(object, function(key, value) {
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