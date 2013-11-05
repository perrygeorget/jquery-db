var shortName = "testdb_" + new Date().getTime();
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
