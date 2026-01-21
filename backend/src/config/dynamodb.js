import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "./env.js";

const clientConfig = {
    region: env.awsRegion
};

if (env.dynamodbEndpoint) {
    clientConfig.endpoint = env.dynamodbEndpoint;
}

if (env.dynamodbLocal) {
    clientConfig.credentials = {
        accessKeyId: "local",
        secretAccessKey: "local"
    };
}

const client = new DynamoDBClient(clientConfig);

export const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true
    }
});
