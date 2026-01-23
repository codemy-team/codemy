import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  waitUntilTableExists,
  type CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { env } from "../config/env.js";

interface ClientConfig {
  region: string;
  endpoint?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

const buildClientConfig = (): ClientConfig => {
  const config: ClientConfig = {
    region: env.awsRegion,
  };

  if (env.dynamodbEndpoint) {
    config.endpoint = env.dynamodbEndpoint;
    config.credentials = {
      accessKeyId: "local",
      secretAccessKey: "local",
    };
  }

  return config;
};

const client = new DynamoDBClient(buildClientConfig());

const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error: any) {
    if (error.name === "ResourceNotFoundException") {
      return false;
    }
    throw error;
  }
};

const createTableIfMissing = async (
  definition: CreateTableCommandInput,
): Promise<void> => {
  const exists = await tableExists(definition.TableName!);
  if (exists) {
    console.log(`Table "${definition.TableName}" already exists.`);
    return;
  }

  await client.send(new CreateTableCommand(definition));
  await waitUntilTableExists(
    { client, minDelay: 2, maxWaitTime: 30 },
    { TableName: definition.TableName },
  );
  console.log(`Table "${definition.TableName}" created.`);
};

const run = async (): Promise<void> => {
  const tables: CreateTableCommandInput[] = [
    {
      TableName: env.usersTable,
      AttributeDefinitions: [{ AttributeName: "email", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    },
    {
      TableName: env.coursesTable,
      AttributeDefinitions: [
        { AttributeName: "courseId", AttributeType: "S" },
        { AttributeName: "slug", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "courseId", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [
        {
          IndexName: "slug-index",
          KeySchema: [{ AttributeName: "slug", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    },
    {
      TableName: env.itemsTable,
      AttributeDefinitions: [
        { AttributeName: "courseId", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "courseId", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      BillingMode: "PAY_PER_REQUEST",
    },
    {
      TableName: env.quizAttemptsTable,
      AttributeDefinitions: [
        { AttributeName: "userId", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      BillingMode: "PAY_PER_REQUEST",
    },
  ];

  for (const table of tables) {
    await createTableIfMissing(table);
  }
};

run().catch((error) => {
  console.error("Failed to create tables:", error);
  process.exit(1);
});
