

module.exports.dbconnectionparams = {
    host: (process.env.PGHOST ? process.env.PGHOST : 'localhost'),
    port: (process.env.PGPORT ? process.env.PGPORT : '5432'),
    user: (process.env.PGUSER ? process.env.PGUSER : process.env.USER),
    password: (process.env.PGPASSWORD ? process.env.PGPASSWORD : process.env.USER),
    database: (process.env.PGDATABASE ? process.env.PGDATABASE : process.env.USER),
    passworddecrypted: false
};

module.exports.skyconnectparams = {
    primaryhost: (process.env.SKYCONNECTHOST1 ? process.env.SKYCONNECTHOST1 : 'https://primary.host/xml/service1.asmx/XmlResponse'),
    secondaryhost: (process.env.SKYCONNECTHOST2 ? process.env.SKYCONNECTHOST2 : 'https://secondary.host/xml/service1.asmx/XmlResponse'),
    user: (process.env.SKYCONNECTUSER ? process.env.SKYCONNECTUSER : 'foo'),
    password: (process.env.SKYCONNECTPASSWORD ? process.env.SKYCONNECTPASSWORD : 'bar'),
    requestsnewmessagesonly: (process.env.SKYCONNECT_ONLYNEWMESSAGES ? process.env.SKYCONNECT_ONLYNEWMESSAGES : 'N'),
    passworddecrypted: false
};



