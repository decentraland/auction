import parseBytea from "postgres-bytea";

const signedMessage = {
  serialize(obj, encoding = "utf8") {
    return Object.assign({}, obj, {
      message: Buffer.from(obj.message, encoding),
      signature: Buffer.from(obj.signature, encoding)
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
