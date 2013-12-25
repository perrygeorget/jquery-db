/*global jQuery, console, SQLStatementCallback, SQLStatementErrorCallback */
(function (jQuery) {
    "use strict";

    /**
     * Simplified API for retrieving entities by composing a criterion via chaining
     *
     * @param {JQueryDatabase} db
     * @param {String} tableName
     * @constructor
     */
    function JQueryDatabaseCriteria(db, tableName) {
        this.db = db;
        this.tableName = tableName;

        this.maxResults = undefined;
        this.firstResult = 0;
        this.restrictions = [];
        this.order = [];

        /**
         * Called when a criteria successfully executes
         *
         * @callback JQueryDatabaseCriteria_successCallback
         * @param {SQLTransaction} [transaction] the transaction
         * @param {SQLResultSet} [resultSet] the result set
         */
        function JQueryDatabaseCriteria_successCallback(transaction, resultSet) {}

        /**
         * Called when a criteria fails to execute
         *
         * @callback JQueryDatabaseCriteria_errorCallback
         * @param {SQLTransaction} [transaction] the transaction
         * @param {SQLError} [error] the error
         */
        function JQueryDatabaseCriteria_errorCallback(transaction, error) {}

        /**
         * Set a limit upon the number of objects to be retrieved.
         *
         * @param {Number} count
         * @returns {JQueryDatabaseCriteria}
         */
        this.setMaxResults = function (count) {
            this.maxResults = count;
            return this;
        };

        /**
         * Set the first result to be retrieved.
         *
         * @param {Number} offset
         * @returns {JQueryDatabaseCriteria}
         */
        this.setFirstResult = function (offset) {
            this.firstResult = offset;
            return this;
        };

        /**
         * Add an ordering to the result set.
         *
         * @param {JQueryDatabaseOrder} order
         * @returns {JQueryDatabaseCriteria}
         */
        this.addOrder = function (order) {
            this.order.push(order);
            return this;
        };

        /**
         * Set the first result to be retrieved.
         *
         * @param {JQueryDatabaseRestriction} restriction
         * @returns {JQueryDatabaseCriteria}
         */
        this.add = function (restriction) {
            this.restrictions.push(restriction);

            return this;
        };

        /**
         * Selects records from the database.
         *
         * @param {JQueryDatabaseCriteria_successCallback} successCallback Handles completed queries
         * @param {JQueryDatabaseCriteria_errorCallback} errorCallback Handles failed queries
         * @returns {JQueryDatabaseCriteria}
         */
        this.list = function (successCallback, errorCallback) {
            var sql = "SELECT _ROWID_, * FROM " + this.tableName;
            this._executeCriteria(sql, successCallback, errorCallback);
            return this;
        };

        /**
         * Counts records in the database.
         *
         * @param {JQueryDatabaseCriteria_successCallback} successCallback Handles completed queries
         * @param {JQueryDatabaseCriteria_errorCallback} errorCallback Handles failed queries
         * @returns {JQueryDatabaseCriteria}
         */
        this.count = function (successCallback, errorCallback) {
            var sql = "SELECT COUNT(*) AS count FROM " + this.tableName;
            this._executeCriteria(sql, successCallback, errorCallback);
            return this;
        };

        /**
         * Removed records from the database.
         *
         * @param {JQueryDatabaseCriteria_successCallback} successCallback Handles completed queries
         * @param {JQueryDatabaseCriteria_errorCallback} errorCallback Handles failed queries
         * @returns {JQueryDatabaseCriteria}
         */
        this.remove = function (successCallback, errorCallback) {
            var sql = "DELETE FROM " + this.tableName;
            this._executeCriteria(sql, successCallback, errorCallback);
            return this;
        };

        /**
         * Returns the where clause that is used when picking data to select or manipulate
         *
         * @param {Array} args
         * @returns {string} where clause
         * @protected
         */
        this._getWhereClause = function (args) {
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
         * @param {String} sql the unfiltered unrestricted statement
         * @param {JQueryDatabaseCriteria_successCallback} successCallback Handles completed queries
         * @param {JQueryDatabaseCriteria_errorCallback} errorCallback Handles failed queries
         * @private
         */
        this._executeCriteria = function (sql, successCallback, errorCallback) {
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

            // console.log(sql, args);

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLResultSet} [resultSet]
             */
            var myCallback = function (transaction, resultSet) {
                if (successCallback !== undefined) {
                    successCallback(transaction, resultSet);
                }
            };

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLError} [error]
             */
            var myErrorCallback = function (transaction, error) {
                if (errorCallback !== undefined) {
                    errorCallback(transaction, error);
                }
            };

            /**
             *
             * @param {SQLTransaction} [tx]
             */
            var caller = function (tx) {
                tx.executeSql(sql, args, myCallback, myErrorCallback);
            };

            this.db.database.transaction(caller);
        };
    }

    /**
     * Result set ordering
     *
     * @param {String} property
     * @param {Boolean} [isAscending]
     * @constructor
     */
    function JQueryDatabaseOrder(property, isAscending) {
        JQueryDatabaseOrder.prototype.isAscending = true;

        this.property = property;
        if (isAscending !== undefined) {
            this.isAscending = isAscending;
        }

        this.toString = function () {
            var order;
            if (this.isAscending) {
                order = "ASC";
            } else {
                order = "DESC";
            }

            return this.property + " " + order;
        };
    }

    /**
     * Filters for database queries
     *
     * @param {String} expr
     * @param {Array} [args]
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
     * @param {String} message
     * @constructor
     */
    function JQueryDatabaseException(message) {
        JQueryDatabaseRestriction.prototype.message = "JQuery Database Exception";

        if (message != undefined) {
            this.message = message;
        }

        this.toString = function () {
            return this.message;
        };
    }

    /**
     * A connection to the database.
     *
     * @param {Database} database
     * @constructor
     */
    function JQueryDatabase(database) {
        this.typeName = jQuery.db.typeName;
        this.restriction = jQuery.db.restriction;

        this.database = database;

        /**
         *
         * @param {Database} database
         * @param {String} sql
         * @param {Array} [args]
         * @param {SQLStatementCallback|Function} [callback]
         * @param {SQLStatementErrorCallback|Function} [errorCallback]
         */
        function execute(database, sql, args, callback, errorCallback) {
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

            /**
             *
             * @param {SQLTransaction} [tx]
             */
            var caller = function (tx) {
                args = args || [];
                tx.executeSql(sql, args, myCallback, myErrorCallback);
            };

            database.transaction(caller);
        }

        /**
         *
         * @param {Function} callback
         * @return {JQueryDatabase}
         */
        this.tables = function (callback) {
            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLResultSet} [resultSet]
             */
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

            /**
             *
             * @param {SQLTransaction} transaction
             * @param {SQLError} error
             */
            var myErrorCallback = function (transaction, error) {
                // console.log("error :: " + error.message);
            };

            execute(this.database, sql, ["table"], mySuccessCallback, myErrorCallback);

            return this;
        };

        /**
         *
         * @param {{name: String, [columns]: [{name: String, type: String, [constraint]: String}], [constraints]: Array, [dropOrIgnore]: String, [success]: Function, [error]: Function}} params
         * @return {JQueryDatabase}
         */
        this.createTable = function (params) {
            params = params || {};

            var tableName = params.name;
            var columnsAndConstraints = [];

            jQuery.each(params.columns, function (index, column) {
                if (typeof column === "object") {
                    var columnAsString = column.name;

                    if (column.hasOwnProperty("type")) {
                        var typeName = column.type.toUpperCase();
                        if (typeName === jQuery.db.typeName.text || typeName === jQuery.db.typeName.number || typeName === jQuery.db.typeName.int || typeName === jQuery.db.typeName.integer || typeName === jQuery.db.typeName.real) {
                            columnAsString = columnAsString + " " + typeName;
                        } else {
                            throw new JQueryDatabaseException("Unknown type, \"" + typeName + "\"");
                        }
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
                execute(this.database, "DROP TABLE IF EXISTS " + tableName, []);
            }

            execute(this.database, sql, [], successCallback, errorCallback);

            return this;
        };

        /**
         *
         * @param {{name: String, [ignore]: Boolean, [success]: Function, [error]: Function}} params
         * @return {JQueryDatabase}
         */
        this.dropTable = function (params) {
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

            execute(this.database, sql, [], successCallback, errorCallback);

            return this;
        };

        /**
         *
         * @param {String} tableName
         * @param {{data: {}, [success]: Function, [error]: Function}} params
         * @returns {JQueryDatabase}
         */
        this.insert = function (tableName, params) {
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

            execute(this.database, sql, values, successCallback, errorCallback);

            return this;
        };

        /**
         * This class is a simplified API for retrieving entities by composing a criterion via chaining.
         *
         * @param {String} tableName
         * @returns {JQueryDatabaseCriteria}
         */
        this.criteria = function (tableName) {
            return new JQueryDatabaseCriteria(this, tableName);
        };
    }

    /**
     *
     * @param {String} shortName
     * @param {String} version
     * @param {String} displayName
     * @param {Number} maxSize
     * @param {DatabaseCallback|Function} [creationCallback]
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

    jQuery.db.typeName = {
        text: "TEXT",
        numeric: "NUM",
        int: "INT",
        integer: "INTEGER",
        real: "REAL",
        none: ""
    };

    jQuery.db.columnConstraint = {
        primaryKey: function (params) {
        },
        notNull: function (params) {
        },
        unique: function (params) {
        },
        check: function (params) {
        },
        defaultValue: function (params) {
        },
        collate: function (params) {
        },
        foreignKey: function (params) {
        }
    };

    /**
     * Apply ordering by a property.
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
         * @param property
         * @returns {JQueryDatabaseOrder}
         */
        asc: function (property) {
            return jQuery.db.order(property, "ASC");
        },

        /**
         * Descending order
         *
         * @param property
         * @returns {JQueryDatabaseOrder}
         */
        desc: function (property) {
            return jQuery.db.order(property, "DESC");
        }
    });

    /**
     * Apply a constraint expressed in SQL.
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
         * @param property
         * @returns {JQueryDatabaseRestriction}
         */
        isEmpty: function (property) {
            return new JQueryDatabaseRestriction("(" + property + " IS NULL OR " + property + " = '')");
        },

        /**
         * Constrain a collection valued property to be non-empty
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
         * @param property
         * @returns {JQueryDatabaseRestriction}
         */
        isNotNull: function (property) {
            return new JQueryDatabaseRestriction(property + " IS NOT NULL");
        },

        /**
         * Apply an "is null" constraint to the named property
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
         * @param {String} property
         * @param {*} value
         */
        like: function (property, value) {
            return new JQueryDatabaseRestriction(property + " LIKE ?", [value]);
        },

        /**
         * Apply a "greater than" constraint to the named property
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