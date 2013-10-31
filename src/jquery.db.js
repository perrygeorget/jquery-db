/*global jQuery, console, SQLStatementCallback, SQLStatementErrorCallback */
(function ($) {
    "use strict";

    /**
     * This class is a simplified API for retrieving entities by composing a criterion via chaining.
     *
     * @param {JQueryDatabase} database
     * @param {String} tableName
     * @constructor
     */
    function JQueryDatabaseCriteria(database, tableName) {
        this.database = database;
        this.tableName = tableName;

        this.maxResults = undefined;
        this.firstResult = 0;
        this.restrictions = [];
        this.order = [];

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
         *
         */
        this.list = function (callback, successCallback, errorCallback) {
            var sql = "SELECT _ROWID_, * FROM " + this.tableName;
            var args = [];

            if (this.restrictions.length > 0) {
                var where = [];
                $.each(this.restrictions, function (index, obj) {
                    where.push(obj.expr);
                    var i;
                    for (i = 0; i < obj.args.length; i = i + 1) {
                        args.push(obj.args[i]);
                    }
                });
                sql = sql + " WHERE " + where.join(" AND ");
            }
            if (this.order.length > 0) {
                var order = [];
                $.each(this.order, function (index, obj) {

                });
                sql = sql + " ORDER BY " + this.order.join(",");
            }
            if (typeof this.maxResults === "Number") {
                sql = sql + " LIMIT " + this.maxResults;
            }
            if (this.firstResult > 0) {
                sql = sql + " OFFSET " + this.firstResult;
            }

            console.log(sql, args);

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLResultSet} [resultSet]
             */
            var myCallback = function (transaction, resultSet) {
                var data = [];
                var i, len;
                len = resultSet.rows.length;
                for (i = 0; i < len; i = i + 1) {
                    data.push(resultSet.rows.item(i));
                }

                console.log("DATA :: ", data);

                if (callback !== undefined) {
                    callback(transaction, resultSet);
                }
            };

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLError} [error]
             */
            var myErrorCallback = function (transaction, error) {
                console.log("ERROR :: ", error);

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

            this.database.database.transaction(caller);
        };

        /**
         *
         */
        this.count = function (callback, successCallback, errorCallback) {
            var sql = "SELECT COUNT(*) AS count FROM " + this.tableName;
            var args = [];

            if (this.restrictions.length > 0) {
                var where = [];
                $.each(this.restrictions, function (index, obj) {
                    where.push(obj.expr);
                    var i;
                    for (i = 0; i < obj.args.length; i = i + 1) {
                        args.push(obj.args[i]);
                    }
                });
                sql = sql + " WHERE " + where.join(" AND ");
            }
            if (this.order.length > 0) {
                var order = [];
                $.each(this.order, function (index, obj) {

                });
                sql = sql + " ORDER BY " + this.order.join(",");
            }
            if (typeof this.maxResults === "Number") {
                sql = sql + " LIMIT " + this.maxResults;
            }
            if (this.firstResult > 0) {
                sql = sql + " OFFSET " + this.firstResult;
            }

            console.log(sql, args);

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLResultSet} [resultSet]
             */
            var myCallback = function (transaction, resultSet) {
                var data = [];
                var i, len;
                len = resultSet.rows.length;
                for (i = 0; i < len; i = i + 1) {
                    data.push(resultSet.rows.item(i));
                }

                console.log("DATA :: ", data);

                if (callback !== undefined) {
                    callback(transaction, resultSet);
                }
            };

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLError} [error]
             */
            var myErrorCallback = function (transaction, error) {
                console.log("ERROR :: ", error);

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

            this.database.database.transaction(caller);
        };

        /**
         *
         */
        this["delete"] = function (callback, successCallback, errorCallback) {
            var sql = "DELETE FROM " + this.tableName;
            var args = [];

            if (this.restrictions.length > 0) {
                var where = [];
                $.each(this.restrictions, function (index, obj) {
                    where.push(obj.expr);
                    var i;
                    for (i = 0; i < obj.args.length; i = i + 1) {
                        args.push(obj.args[i]);
                    }
                });
                sql = sql + " WHERE " + where.join(" AND ");
            }

            console.log(sql, args);

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLResultSet} [resultSet]
             */
            var myCallback = function (transaction, resultSet) {
                console.log("SUCCESS :: ", resultSet.rowsAffected);

                if (callback !== undefined) {
                    callback(transaction, resultSet);
                }
            };

            /**
             *
             * @param {SQLTransaction} [transaction]
             * @param {SQLError} [error]
             */
            var myErrorCallback = function (transaction, error) {
                console.log("ERROR :: ", error);

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

            this.database.database.transaction(caller);
        };
    }

    /**
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

    function JQueryDatabaseException(message) {
        this.message = message;

        this.toString = function () {
            return this.message;
        };
    }

    /**
     * A connection to the database.
     *
     * @param {Database} database
     * @param {String} shortName
     * @constructor
     */
    function JQueryDatabase(database, shortName) {
        this.database = database;
        this.shortName = shortName;

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
                    if (item.name !== "__WebKitDatabaseInfoTable__") {
                        tables.push(item.name);
                    }
                }

                if (typeof callback === "function") {
                    callback(tables);
                }
            };

            var sql = "SELECT name FROM sqlite_master WHERE type=?";

            /**
             *
             * @param {SQLTransaction} transaction
             * @param {SQLError} error
             */
            var myErrorCallback = function (transaction, error) {
                console.log("error :: " + error.message);
            };

            execute(this.database, sql, ["table"], mySuccessCallback, myErrorCallback);

            return this;
        };

        /**
         *
         * @param {{name: String, [columns]: Array, [dropOrIgnore]: String, [success]: Function, [error]: Function}} params
         * @return {JQueryDatabase}
         */
        this.createTable = function (params) {
            params = params || {};

            var tableName = params.name;
            var columns = params.columns || [];

            var i, column;
            for (i = 0; i < columns.length; i++) {
                var columnAtIndex = columns[i];
                if (typeof  columnAtIndex === "object") {
                    column = columnAtIndex.name;

                    if (columnAtIndex.hasOwnProperty("type")) {
                        var typeName = columnAtIndex.type.toUpperCase();
                        if (typeName === $.db.typeName.text || typeName === $.db.typeName.number || typeName === $.db.typeName.integer || typeName === $.db.typeName.real) {
                            column = column + " " + typeName;
                        } else {
                            throw new JQueryDatabaseException("Unknown type, \"" + typeName + "\"");
                        }
                    }

                    if (columnAtIndex.hasOwnProperty("constraint")) {

                    }
                }
            }

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

            sql = sql + tableName + " (" + columns + ")";

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
    $.db = function (shortName, version, displayName, maxSize, creationCallback) {
        var db;
        if (!window.openDatabase) {
            db = undefined;
        } else {
            var openDB = window.openDatabase(shortName, version, displayName, maxSize, creationCallback);
            if (openDB) {
                db = new JQueryDatabase(openDB, shortName);
            } else {
                if (window.console) {
                    console.log("HTML5 DB Unavailable");
                }
                db = undefined;
            }
        }

        return db;
    };

    $.db.typeName = {
        text: "TEXT",
        numeric: "NUM",
        integer: "INT",
        real: "REAL",
        none: ""
    };

    $.db.columnConstraint = {
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
    $.db.order = function (property, isAscending) {
        return new JQueryDatabaseOrder(property, isAscending);

    };

    $.extend($.db.order, {
        /**
         * Ascending order
         *
         * @param property
         * @returns {JQueryDatabaseOrder}
         */
        asc: function (property) {
            return $.db.order(property, "ASC");
        },

        /**
         * Descending order
         *
         * @param property
         * @returns {JQueryDatabaseOrder}
         */
        desc: function (property) {
            return $.db.order(property, "DESC");
        }
    });

    /**
     * Apply a constraint expressed in SQL.
     *
     * @param {String} expr
     * @param {Array} args
     * @returns {JQueryDatabaseRestriction}
     */
    $.db.restriction = function (expr, args) {
        return new JQueryDatabaseRestriction(expr, args);
    };

    $.extend($.db.restriction, {
        // allEq: function (object) {},

        // and: function (criterionA, criterionB) {},

        between: function (property, lowValue, highValue) {
            return new JQueryDatabaseRestriction(property + " BETWEEN ? AND ? ", [lowValue, highValue]);
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
         * @param {*} value
         * @returns {JQueryDatabaseRestriction}
         */
        geProperty: function (property, value) {
            return new JQueryDatabaseRestriction(property + " >= ? ", [value]);
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
         * @param value
         * @returns {JQueryDatabaseRestriction}
         */
        gtProperty: function (property, value) {
            return new JQueryDatabaseRestriction(property + " > ?", [value]);
        },

        /**
         * Apply an "equal" constraint to the identifier property
         *
         * @param value
         * @returns {JQueryDatabaseRestriction}
         */
        idEq: function (value) {
            return new JQueryDatabaseRestriction("_ROWID_ = ", [value]);
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
            $.each(values, function () {
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
         * @param {*} value
         * @returns {JQueryDatabaseRestriction}
         */
        leProperty: function (property, value) {
            return new JQueryDatabaseRestriction(property + " <= ? ", [value]);
        },

        /**
         * Apply a "like" constraint to the named property
         *
         * @param {String} property
         * @param {*} value
         */
        like: function (property, value) {
            return new JQueryDatabaseRestriction(property + " LIKE ? ", [value]);
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
         * @param value
         * @returns {JQueryDatabaseRestriction}
         */
        ltProperty: function (property, value) {
            return new JQueryDatabaseRestriction(property + " < ?", [value]);
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
         * @param value
         * @returns {JQueryDatabaseRestriction}
         */
        neProperty: function (property, value) {
            return new JQueryDatabaseRestriction(property + " != ?", [value]);
        }

        // not: function (criterion) {}

        // or: function (criterionA, criterionB) {},
    });
}(jQuery));