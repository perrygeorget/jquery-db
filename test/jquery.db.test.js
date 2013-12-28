var shortName = "test_db_" + new Date().getTime();
var version = "";
var displayName = "Test Databases";
var maxSize = 1024 * 1024;

module("Creation of a database");

test("Can open database", function () {
    var db = $.db(shortName, version, displayName, maxSize);

    ok(typeof db !== "undefined", "Can open database.");
});


module("Table creation", {
    setup: function () {
        stop(1);
        $.db(shortName, version, displayName, maxSize)
            .dropTable({
                name: "MyTestTable",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            });
    },
    teardown: function () {
        stop(1);
        $.db(shortName, version, displayName, maxSize)
            .dropTable({
                name: "MyTestTable",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            });
    }
});

test("Create a table with a simple definition", 1, function () {
    var msg = "should have created a table";
    var db = $.db(shortName, version, displayName, maxSize);

    db.createTable({
        name: "MyTestTable",
        columns: [
            "id INT",
            "value TEXT"
        ],
        success: function () {
            ok(true, msg);
            start();
        },
        error: function (transaction, error) {
            ok(false, msg + " :: " + error.message);
            start();
        }
    });
}, true);

test("Create a table with a complex column definition", 1, function () {
    var msg = "should have created a table";
    var db = $.db(shortName, version, displayName, maxSize);

    db.createTable({
        name: "MyTestTable",
        columns: [
            {
                name: "id",
                type: "INTEGER",
                constraint: "PRIMARY KEY AUTOINCREMENT"
            },
            {
                name: "value",
                type: "TEXT",
                constraint: "NOT NULL"
            }
        ],
        success: function () {
            ok(true, msg);
            start();
        },
        error: function (transaction, error) {
            ok(false, msg + " :: " + error.message);
            start();
        }
    });
}, true);

test("Create a table with simple constraints", 1, function () {
    var msg = "should have created a table";
    var db = $.db(shortName, version, displayName, maxSize);

    db.createTable({
        name: "MyTestTable",
        columns: [
            {
                name: "id",
                type: "INTEGER",
                constraint: "PRIMARY KEY AUTOINCREMENT"
            },
            {
                name: "value",
                type: "TEXT"
            }
        ],
        constraints: [
            "UNIQUE (value)"
        ],
        success: function () {
            ok(true, msg);
            start();
        },
        error: function (transaction, error) {
            ok(false, msg + " :: " + error.message);
            start();
        }
    });
}, true);

test("Can not create table twice", 1, function () {
    var msg = "should not be able to create the same table twice";
    var db = $.db(shortName, version, displayName, maxSize);

    db.createTable({
        name: "MyTestTable",
        columns: [
            "id INT",
            "value TEXT"
        ],
        success: function () {
            db.createTable({
                name: "MyTestTable",
                columns: [
                    "id INT",
                    "value TEXT"
                ],
                success: function () {
                    ok(false, msg);
                    start();
                },
                error: function () {
                    ok(true, msg);
                    start();
                }
            });
        },
        error: function () {
            ok(false, msg);
            start();
        }
    });
}, true);

test("Creation callback has JQueryDatabase as its arguments.", 1, function () {
    var timeout = setTimeout(function () {
        start();
    }, 3);

    var seed = Math.floor(Math.random() * 1000);
    var shortName = "test_db_" + new Date().getTime() + "_" + seed;
    var myDB = $.db(shortName, "", "Version Test", 1024, function (db) {
        ok(Object.getPrototypeOf(db) === Object.getPrototypeOf(myDB), "Expected argument to be an instance of JQueryDatabase");

        clearTimeout(timeout);
        start();
    });

    stop();
});


module("Database version management", {});

test("Can get version when set", 1, function () {
    var timeout = setTimeout(function () {
        start();
    }, 3);

    var seed = Math.floor(Math.random() * 1000);
    var shortName = "test_db_" + new Date().getTime() + "_" + seed;
    $.db(shortName, "", "Version Test", 1024, function (db) {
        var version = db.getVersion();
        equal(version, "", "Expected the version not to be set");

        clearTimeout(timeout);
        start();
    });

    stop();
});

test("Can add a migration", 1, function () {
    var timeout = setTimeout(function () {
        start();
    }, 3);

    var seed = Math.floor(Math.random() * 1000);
    var shortName = "test_db_" + new Date().getTime() + "_" + seed;
    var db = $.db(shortName, "", "Version Test", 1024, function (db) {
        clearTimeout(timeout);
        start();
    });

    stop();

    db.addVersionMigration("", "1.0", function (transaction) {
        // does nothing
    });

    ok(db.migrations.hasOwnProperty(":1.0"), "Should have the 0 -> 1.0 migration.");
});

test("Can not migrate when version not found.", 2, function () {
    var timeout = setTimeout(function () {
        start();
    }, 3);

    var seed = Math.floor(Math.random() * 1000);
    var shortName = "test_db_" + new Date().getTime() + "_" + seed;
    $.db(shortName, "", "Version Test", 1024, function (db) {
        clearTimeout(timeout);

        equal(db.getVersion(), "", "Expected the version not to be set");

        raises(function () {
            db.changeVersion("1.0");
        }, "Migration not found [ -> 1.0]");

        start();
    });

    stop();
});

//test("Can migrate to a found version.", 3, function() {
//    var timeout = setTimeout(function() {
//        start();
//    }, 3);
//
//    var migrationExecuted = false;
//
//    var seed = Math.floor(Math.random() * 1000);
//    var shortName = "test_db_" + "_" + seed;
//    var db = $.db(shortName, "", "Version Test", 1024 * 1024, function(db) {
//        clearTimeout(timeout);
//
//        db.createTable({
//            name: "MyTestTable",
//            columns: [
//                "id INT",
//                "value TEXT"
//            ],
//            success: function () {
//                ok(true);
//                start();
//            },
//            error: function () {
//                ok(false);
//                start();
//            }
//        });
//    });
//
//    stop();
//
//    db.addVersionMigration("","1.0", function(transaction) {
//        migrationExecuted = true;
//    });
//
//    timeout = setTimeout(function() {
//        start();
//    }, 3);
//
//    db.changeVersion("1.0", function() {
//        clearTimeout(timeout);
//        ok(true);
//        start();
//    }, function(error) {
//        clearTimeout(timeout);
//        ok(false, error.message);
//        start();
//    });
//
//    stop();
//
//    ok(migrationExecuted, "Migration should have been executed");
//});


module("Table deletion", {
    setup: function () {
        stop(2);
        var db = $.db(shortName, version, displayName, maxSize);
        db.dropTable({
            name: "MyTestTable",
            ignore: true,
            success: function () {
                start();
                db.createTable({
                    name: "MyTestTable",
                    columns: [
                        "id INT",
                        "value TEXT"
                    ],
                    success: function () {
                        start();
                    },
                    error: function () {
                        start();
                    }
                });
            },
            failure: function () {
                start(2);
            }
        });
    },
    teardown: function () {
        stop(1);
        $.db(shortName, version, displayName, maxSize)
            .dropTable({
                name: "MyTestTable",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            });
    }
});

test("Drop a table", 1, function () {
    var msg = "should have dropped a table";
    var db = $.db(shortName, version, displayName, maxSize);

    db.dropTable({
        name: "MyTestTable",
        success: function () {
            ok(true, msg);
            start();
        },
        error: function (transaction, error) {
            ok(false, msg + " :: " + error.message);
            start();
        }
    });
}, true);

test("Can not drop the same table twice", 1, function () {
    var msg = "should not be able to drop the same table twice";
    var db = $.db(shortName, version, displayName, maxSize);

    db.dropTable({
        name: "MyTestTable",
        success: function () {
            db.dropTable({
                name: "MyTestTable",
                success: function () {
                    ok(false, msg);
                    start();
                },
                error: function () {
                    ok(true, msg);
                    start();
                }
            });
        },
        error: function (transaction, error) {
            ok(false, msg + " :: " + error.message);
            start();
        }
    });
});


module("Table deletion (where table does not exist)", {
    setup: function () {
        stop();
        var db = $.db(shortName, version, displayName, maxSize);
        db.dropTable({
            name: "MyTestTable",
            ignore: true,
            success: function () {
                start();
            },
            failure: function () {
                start();
            }
        });
    }
});

test("Can not drop a table that does not exist", 1, function () {
    var msg = "should not have dropped the table";
    var db = $.db(shortName, version, displayName, maxSize);

    db.dropTable({
        name: "MyTestTable",
        success: function () {
            ok(false, msg);
            start();
        },
        error: function () {
            ok(true, msg);
            start();
        }
    });
}, true);

test("Can ignore dropping a table that does not exist", 1, function () {
    var msg = "should have ignored the drop table";
    var db = $.db(shortName, version, displayName, maxSize);

    db.dropTable({
        name: "MyTestTable",
        ignore: true,
        success: function () {
            ok(true, msg);
            start();
        },
        error: function (transaction, error) {
            ok(false, msg + " :: " + error.message);
            start();
        }
    });
}, true);


module("Show tables with one table", {
    setup: function () {
        stop(2);
        var db = $.db(shortName, version, displayName, maxSize);
        db.dropTable({
            name: "MyTestTable",
            ignore: true,
            success: function () {
                start();
                db.createTable({
                    name: "MyTestTable",
                    columns: [
                        "id INT",
                        "value TEXT"
                    ],
                    success: function () {
                        start();
                    },
                    error: function () {
                        start();
                    }
                });
            },
            failure: function () {
                start(2);
            }
        });
    },
    teardown: function () {
        stop(1);
        $.db(shortName, version, displayName, maxSize)
            .dropTable({
                name: "MyTestTable",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            });
    }
});

test("Has just 1 table", 1, function () {
    var msg = "should have listed one table";
    var db = $.db(shortName, version, displayName, maxSize);

    var tablesTimeout = window.setTimeout(function () {
        ok(false, msg + " (timeout)");
        start();
        tablesTimeout = undefined;
    }, 250);

    db.tables(function (tables) {
        if (tablesTimeout) {
            window.clearTimeout(tablesTimeout);
            tablesTimeout = undefined;

            equal(tables.length, 1, msg);
            start();
        }
    });
}, true);

test("Has the expected table", 1, function () {
    var msg = "should have the expected table";
    var db = $.db(shortName, version, displayName, maxSize);

    var tablesTimeout = window.setTimeout(function () {
        ok(false, msg + " (timeout)");
        start();
        tablesTimeout = undefined;
    }, 250);

    db.tables(function (tables) {
        if (tablesTimeout) {
            window.clearTimeout(tablesTimeout);
            tablesTimeout = undefined;

            equal(tables[0], "MyTestTable", msg);
            start();
        }
    });
}, true);


module("Show tables with two table", {
    setup: function () {
        stop(2);
        var db = $.db(shortName, version, displayName, maxSize);
        db.dropTable({
            name: "MyTestTable",
            ignore: true,
            success: function () {
                start();
                db.createTable({
                    name: "MyTestTable1",
                    columns: [
                        "id INT",
                        "value TEXT"
                    ],
                    success: function () {
                        start();
                    },
                    error: function () {
                        start();
                    }
                }).createTable({
                        name: "MyTestTable2",
                        columns: [
                            "id INT",
                            "value TEXT"
                        ],
                        success: function () {
                            start();
                        },
                        error: function () {
                            start();
                        }
                    });
            },
            failure: function () {
                start(2);
            }
        });
    },
    teardown: function () {
        stop(1);
        $.db(shortName, version, displayName, maxSize)
            .dropTable({
                name: "MyTestTable1",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            }).dropTable({
                name: "MyTestTable2",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            });
    }
});

test("Has just 2 tables", 1, function () {
    var msg = "should have listed one table";
    var db = $.db(shortName, version, displayName, maxSize);

    var tablesTimeout = window.setTimeout(function () {
        ok(false, msg + " (timeout)");
        start();
        tablesTimeout = undefined;
    }, 250);

    db.tables(function (tables) {
        if (tablesTimeout) {
            window.clearTimeout(tablesTimeout);
            tablesTimeout = undefined;

            equal(tables.length, 2, msg);
            start();
        }
    });
}, true);

test("Has the expected tables", 1, function () {
    var msg = "should have the expected table";
    var db = $.db(shortName, version, displayName, maxSize);

    var tablesTimeout = window.setTimeout(function () {
        ok(false, msg + " (timeout)");
        start();
        tablesTimeout = undefined;
    }, 250);

    db.tables(function (tables) {
        if (tablesTimeout) {
            window.clearTimeout(tablesTimeout);
            tablesTimeout = undefined;

            deepEqual(tables, ["MyTestTable1", "MyTestTable2"], msg);
            start();
        }
    });
}, true);


module("Can insert data", {
    setup: function () {
        stop(1);
        var db = $.db(shortName, version, displayName, maxSize);
        db.dropTable({
            name: "MyTestTable",
            ignore: true,
            success: function () {
                db.createTable({
                    name: "MyTestTable",
                    columns: [
                        {
                            name: "value",
                            type: "TEXT",
                            constraint: "NOT NULL"
                        }
                    ],
                    success: function () {
                        start();
                    },
                    error: function () {
                        start();
                    }
                });
            },
            failure: function () {
                start();
            }
        });
    },
    teardown: function () {
        stop(1);
        $.db(shortName, version, displayName, maxSize)
            .dropTable({
                name: "MyTestTable",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            });
    }
});

test("Can insert data into table that exists", 4, function () {
    var db = $.db(shortName, version, displayName, maxSize);
    var tableName = "MyTestTable";
    var value = "hello world";

    stop();
    db.insert(tableName, {
        data: {
            value: value
        },
        success: function (transaction, results) {
            var id = results.insertId;
            var affected = results.rowsAffected;

            equal(affected, 1, "should be able to insert data");
            ok(typeof id !== "undefined", "has an unique id");

            db.criteria(tableName).list(
                function (transaction, results) {
                    var rows = results.rows;
                    equal(rows.length, 1, "should be 1 row in the table");

                    var row = rows.item(0);
                    equal(row.value, value, "expected the inserted value");

                    start();
                },
                function (transaction, error) {
                    ok(false, error.message);
                    start();
                }
            );
            start();
        },
        failure: function (transaction, error) {
            ok(false, error.message);
            start(2);
        }
    });
});


module("Restrictions generate correct SQL snippets");

test("Restriction allEq -- complex", function () {
    var restriction = $.db.restriction.allEq({
        name: "Peppercock",
        rank: "Private",
        serial_number: "8675309"
    });
    equal(restriction.expr, "(name = ? AND rank = ? AND serial_number = ?)", "Expression should match");
    deepEqual(restriction.args, ["Peppercock", "Private", "8675309"], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.allEq({
        name: "Peppercock",
        rank: "Private",
        serial_number: "8675309"
    });
    equal(restrictionFromInstance.expr, "(name = ? AND rank = ? AND serial_number = ?)", "Expression should match");
    deepEqual(restrictionFromInstance.args, ["Peppercock", "Private", "8675309"], "Arguments should match");
});

test("Restriction and -- complex", function () {
    var db = $.db(shortName, version, displayName, maxSize);
    var tableName = "MyTestTable";

    var callback = function (criteria) {
        window.console.log("criteria hit");
    };

    var criteriaA = db.criteria(tableName, callback);
    var criteriaB = db.criteria(tableName, callback);

    criteriaA.add(db.restriction.eq("a", "a"));
    criteriaA.add(db.restriction.eq("b", "b"));

    criteriaB.add(db.restriction.eq("c", "c")).add(db.restriction.eq("d", "d"));

    var restriction = $.db.restriction.and(criteriaA, criteriaB);
    equal(restriction.expr, "(a = ? AND b = ?) AND (c = ? AND d = ?)", "Expression should match");
    deepEqual(restriction.args, ["a", "b", "c", "d"], "Arguments should match");

    var restrictionFromInstance = db.restriction.and(criteriaA, criteriaB);
    equal(restrictionFromInstance.expr, "(a = ? AND b = ?) AND (c = ? AND d = ?)", "Expression should match");
    deepEqual(restrictionFromInstance.args, ["a", "b", "c", "d"], "Arguments should match");
});

test("Restriction between", function () {
    var restriction = $.db.restriction.between("high_noon", 11, 13);
    equal(restriction.expr, "high_noon BETWEEN ? AND ?", "Expression should match");
    deepEqual(restriction.args, [11, 13], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.between("high_noon", 11, 13);
    equal(restrictionFromInstance.expr, "high_noon BETWEEN ? AND ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [11, 13], "Arguments should match");
});

test("Restriction eq", function () {
    var restriction = $.db.restriction.eq("the_number", 42);
    equal(restriction.expr, "the_number = ?", "Expression should match");
    deepEqual(restriction.args, [42], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.eq("the_number", 42);
    equal(restrictionFromInstance.expr, "the_number = ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [42], "Arguments should match");
});

test("Restriction eqProperty", function () {
    var restriction = $.db.restriction.eqProperty("a", "b");
    equal(restriction.expr, "a = b", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.eqProperty("a", "b");
    equal(restrictionFromInstance.expr, "a = b", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction ge", function () {
    var restriction = $.db.restriction.ge("the_number", 42);
    equal(restriction.expr, "the_number >= ?", "Expression should match");
    deepEqual(restriction.args, [42], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.ge("the_number", 42);
    equal(restrictionFromInstance.expr, "the_number >= ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [42], "Arguments should match");
});

test("Restriction geProperty", function () {
    var restriction = $.db.restriction.geProperty("a", "b");
    equal(restriction.expr, "a >= b", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.geProperty("a", "b");
    equal(restrictionFromInstance.expr, "a >= b", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction gt", function () {
    var restriction = $.db.restriction.gt("the_number", 42);
    equal(restriction.expr, "the_number > ?", "Expression should match");
    deepEqual(restriction.args, [42], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.gt("the_number", 42);
    equal(restrictionFromInstance.expr, "the_number > ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [42], "Arguments should match");
});

test("Restriction gtProperty", function () {
    var restriction = $.db.restriction.gtProperty("a", "b");
    equal(restriction.expr, "a > b", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.gtProperty("a", "b");
    equal(restrictionFromInstance.expr, "a > b", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction idEq", function () {
    var restriction = $.db.restriction.idEq(88);
    equal(restriction.expr, "_ROWID_ = ?", "Expression should match");
    deepEqual(restriction.args, [88], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.idEq(88);
    equal(restrictionFromInstance.expr, "_ROWID_ = ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [88], "Arguments should match");
});

test("Restriction in", function () {
    var restriction = $.db.restriction.in("peas", ["chickpea", "fava beans"]);
    equal(restriction.expr, "peas in (?, ?)", "Expression should match");
    deepEqual(restriction.args, ["chickpea", "fava beans"], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.in("peas", ["chickpea", "fava beans"]);
    equal(restrictionFromInstance.expr, "peas in (?, ?)", "Expression should match");
    deepEqual(restrictionFromInstance.args, ["chickpea", "fava beans"], "Arguments should match");
});

test("Restriction isEmpty", function () {
    var restriction = $.db.restriction.isEmpty("pod");
    equal(restriction.expr, "(pod IS NULL OR pod = '')", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.isEmpty("pod");
    equal(restrictionFromInstance.expr, "(pod IS NULL OR pod = '')", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction isNotEmpty", function () {
    var restriction = $.db.restriction.isNotEmpty("pod");
    equal(restriction.expr, "(pod IS NOT NULL AND pod != '')", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.isNotEmpty("pod");
    equal(restrictionFromInstance.expr, "(pod IS NOT NULL AND pod != '')", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction isNotNull", function () {
    var restriction = $.db.restriction.isNotNull("value");
    equal(restriction.expr, "value IS NOT NULL", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.isNotNull("value");
    equal(restrictionFromInstance.expr, "value IS NOT NULL", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction isNull", function () {
    var restriction = $.db.restriction.isNull("value");
    equal(restriction.expr, "value IS NULL", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.isNull("value");
    equal(restrictionFromInstance.expr, "value IS NULL", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction le", function () {
    var restriction = $.db.restriction.le("the_number", 42);
    equal(restriction.expr, "the_number <= ?", "Expression should match");
    deepEqual(restriction.args, [42], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.le("the_number", 42);
    equal(restrictionFromInstance.expr, "the_number <= ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [42], "Arguments should match");
});

test("Restriction leProperty", function () {
    var restriction = $.db.restriction.leProperty("a", "b");
    equal(restriction.expr, "a <= b", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.leProperty("a", "b");
    equal(restrictionFromInstance.expr, "a <= b", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction like", function () {
    var restriction = $.db.restriction.like("string", "abc%");
    equal(restriction.expr, "string LIKE ?", "Expression should match");
    deepEqual(restriction.args, ["abc%"], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.like("string", "abc%");
    equal(restrictionFromInstance.expr, "string LIKE ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, ["abc%"], "Arguments should match");
});

test("Restriction lt", function () {
    var restriction = $.db.restriction.lt("the_number", 42);
    equal(restriction.expr, "the_number < ?", "Expression should match");
    deepEqual(restriction.args, [42], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.lt("the_number", 42);
    equal(restrictionFromInstance.expr, "the_number < ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [42], "Arguments should match");
});

test("Restriction ltProperty", function () {
    var restriction = $.db.restriction.ltProperty("a", "b");
    equal(restriction.expr, "a < b", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.ltProperty("a", "b");
    equal(restrictionFromInstance.expr, "a < b", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction ne", function () {
    var restriction = $.db.restriction.ne("the_number", 42);
    equal(restriction.expr, "the_number != ?", "Expression should match");
    deepEqual(restriction.args, [42], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.ne("the_number", 42);
    equal(restrictionFromInstance.expr, "the_number != ?", "Expression should match");
    deepEqual(restrictionFromInstance.args, [42], "Arguments should match");
});

test("Restriction neProperty", function () {
    var restriction = $.db.restriction.neProperty("a", "b");
    equal(restriction.expr, "a != b", "Expression should match");
    deepEqual(restriction.args, [], "Arguments should match");

    var db = $.db(shortName, version, displayName, maxSize);
    var restrictionFromInstance = db.restriction.neProperty("a", "b");
    equal(restrictionFromInstance.expr, "a != b", "Expression should match");
    deepEqual(restrictionFromInstance.args, [], "Arguments should match");
});

test("Restriction not -- complex", function () {
    var db = $.db(shortName, version, displayName, maxSize);
    var tableName = "MyTestTable";

    var callback = function (criteria) {
        window.console.log("criteria hit");
    };

    var criteriaA = db.criteria(tableName, callback);

    criteriaA.add(db.restriction.eq("a", "a")).add(db.restriction.eq("b", "b"));

    var restriction = $.db.restriction.not(criteriaA);
    equal(restriction.expr, "NOT (a = ? AND b = ?)", "Expression should match");
    deepEqual(restriction.args, ["a", "b"], "Arguments should match");

    var restrictionFromInstance = db.restriction.not(criteriaA);
    equal(restrictionFromInstance.expr, "NOT (a = ? AND b = ?)", "Expression should match");
    deepEqual(restrictionFromInstance.args, ["a", "b"], "Arguments should match");
});

test("Restriction or -- complex", function () {
    var db = $.db(shortName, version, displayName, maxSize);
    var tableName = "MyTestTable";

    var callback = function (criteria) {
        window.console.log("criteria hit");
    };

    var criteriaA = db.criteria(tableName, callback);
    var criteriaB = db.criteria(tableName, callback);

    criteriaA.add(db.restriction.eq("a", "a"));
    criteriaA.add(db.restriction.eq("b", "b"));

    criteriaB.add(db.restriction.eq("c", "c")).add(db.restriction.eq("d", "d"));

    var restriction = $.db.restriction.or(criteriaA, criteriaB);
    equal(restriction.expr, "(a = ? AND b = ?) OR (c = ? AND d = ?)", "Expression should match");
    deepEqual(restriction.args, ["a", "b", "c", "d"], "Arguments should match");

    var restrictionFromInstance = db.restriction.or(criteriaA, criteriaB);
    equal(restrictionFromInstance.expr, "(a = ? AND b = ?) OR (c = ? AND d = ?)", "Expression should match");
    deepEqual(restrictionFromInstance.args, ["a", "b", "c", "d"], "Arguments should match");
});

/*
 test("Restriction conjunction -- complex", function() {});

 test("Restriction disjunction -- complex", function() {});
 */

module("Can select data", {
    setup: function () {
        stop(3);
        var db = $.db(shortName, version, displayName, maxSize);
        var tableName = "MyTestTable";
        db.dropTable({
            name: tableName,
            ignore: true,
            success: function () {
                db.createTable({
                    name: tableName,
                    columns: [
                        {
                            name: "id",
                            type: "INTEGER",
                            constraint: "PRIMARY KEY AUTOINCREMENT"
                        },
                        {
                            name: "name",
                            type: "TEXT",
                            constraint: "NOT NULL"
                        },
                        {
                            name: "rank",
                            type: "TEXT",
                            constraint: "NOT NULL"
                        },
                        {
                            name: "male",
                            type: "INT",
                            constraint: "NOT NULL"
                        },
                        {
                            name: "age",
                            type: "INT",
                            constraint: "NOT NULL"
                        }
                    ],
                    success: function () {
                        db.insert(tableName, {
                            data: {
                                name: "John Doe",
                                rank: "Private",
                                male: 1,
                                age: 18
                            },
                            success: function () {
                                start();
                            },
                            failure: function () {
                                start();
                            }
                        }).insert(tableName, {
                                data: {
                                    name: "Jane Doe",
                                    rank: "Private",
                                    male: 0,
                                    age: 18
                                },
                                success: function () {
                                    start();
                                },
                                failure: function () {
                                    start();
                                }
                            }).insert(tableName, {
                                data: {
                                    name: "Jackie Robinson",
                                    rank: "General",
                                    male: 1,
                                    age: 42
                                },
                                success: function () {
                                    start();
                                },
                                failure: function () {
                                    start();
                                }
                            }).insert(tableName, {
                                data: {
                                    name: "John Doe",
                                    rank: "Commander",
                                    male: 1,
                                    age: 55
                                },
                                success: function () {
                                    start();
                                },
                                failure: function () {
                                    start();
                                }
                            });
                    },
                    error: function () {
                        start(4);
                    }
                });
            },
            failure: function () {
                start(4);
            }
        });
    },
    teardown: function () {
        stop(1);
        $.db(shortName, version, displayName, maxSize)
            .dropTable({
                name: "MyTestTable",
                ignore: true,
                success: function () {
                    start();
                },
                failure: function () {
                    start();
                }
            });
    }
});

test("Can select everything", 1, function () {
    var db = $.db(shortName, version, displayName, maxSize);
    var tableName = "MyTestTable";

    var success = function (transaction, resultSet) {
        equal(resultSet.rows.length, 4, "Expected 4 records");
        start();
    };

    var error = function (transaction, error) {
        ok(false, error.message);
        start();
    };

    db.criteria(tableName).list(success, error);
}, true);

test("Can select John Doe", 2, function () {
    var db = $.db(shortName, version, displayName, maxSize);
    var tableName = "MyTestTable";

    var success = function (transaction, resultSet) {
        equal(resultSet.rows.length, 1, "Expected 1 records");
        var item = resultSet.rows.item(0);
        equal(item.name, "Jackie Robinson", "This should be the record for Jackie Robinson");
        start();
    };

    var error = function (transaction, error) {
        ok(false, error.message);
        start();
    };

    db.criteria(tableName).add($.db.restriction.eq("name", "Jackie Robinson")).list(success, error);
}, true);
