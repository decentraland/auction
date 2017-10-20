import parseBytea from "postgres-bytea";

/**
 * Serialize and deserialize messages for interfacing with external resources or the database.
 * @namespace
 */
const signedMessage = {
  serialize(obj, encoding = "utf8") {
    let { message, signature } = obj;

    return Object.assign({}, obj, {
      message: Buffer.from(message, encoding),
      signature: Buffer.from(signature, encoding)
    });
  },

  deserialize(obj, encoding = "utf8") {
    let { message, signature } = obj;

    if (encoding === "bytea") {
      message = parseBytea(message);
      signature = parseBytea(signature);

      encoding = "utf8";
    }

    return Object.assign({}, obj, {
      message: message.toString(encoding),
      signature: signature.toString(encoding)
    });
  }
};

export default signedMessage;
