import {
    CreateTableCommand,
    DescribeTableCommand,
    DynamoDBClient,
    waitUntilTableExists
} from "@aws-sdk/client-dynamodb";
import { env } from "../config/env.js";

const buildClientConfig = () => {
    const config = {
        region: env.awsRegion
    };

    if (env.dynamodbEndpoint) {
        config.endpoint = env.dynamodbEndpoint;
        config.credentials = {
            accessKeyId: "local",
            secretAccessKey: "local"
        };
    }

    return config;
};

const client = new DynamoDBClient(buildClientConfig());

const tableExists = async (tableName) => {
    try {
        await client.send(new DescribeTableCommand({ TableName: tableName }));
        return true;
    } catch (error) {
        if (error.name === "ResourceNotFoundException") {
            return false;
        }
        throw error;
    }
};

const createTableIfMissing = async (definition) => {
    const exists = await tableExists(definition.TableName);
    if (exists) {
        console.log(`Table "${definition.TableName}" already exists.`);
        return;
    }

    await client.send(new CreateTableCommand(definition));
    await waitUntilTableExists(
        { client, minDelay: 2, maxWaitTime: 30 },
        { TableName: definition.TableName }
    );
    console.log(`Table "${definition.TableName}" created.`);
};

const run = async () => {
    const tables = [
        {
            TableName: env.usersTable,
            AttributeDefinitions: [
                { AttributeName: "email", AttributeType: "S" }
            ],
            KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: env.coursesTable,
            AttributeDefinitions: [
                { AttributeName: "courseId", AttributeType: "S" }
            ],
            KeySchema: [{ AttributeName: "courseId", KeyType: "HASH" }],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: env.itemsTable,
            AttributeDefinitions: [
                { AttributeName: "courseId", AttributeType: "S" },
                { AttributeName: "sk", AttributeType: "S" }
            ],
            KeySchema: [
                { AttributeName: "courseId", KeyType: "HASH" },
                { AttributeName: "sk", KeyType: "RANGE" }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: env.quizAttemptsTable,
            AttributeDefinitions: [
                { AttributeName: "userId", AttributeType: "S" },
                { AttributeName: "sk", AttributeType: "S" }
            ],
            KeySchema: [
                { AttributeName: "userId", KeyType: "HASH" },
                { AttributeName: "sk", KeyType: "RANGE" }
            ],
            BillingMode: "PAY_PER_REQUEST"
        }
    ];

    for (const table of tables) {
        await createTableIfMissing(table);
    }
};

run().catch((error) => {
    console.error("Failed to create tables:", error);
    process.exit(1);
});
