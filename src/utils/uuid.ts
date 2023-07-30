import { v4 as uuidv4 } from "uuid";
const { nanoid } = require("nanoid");

export const generateUUID = () => uuidv4();
export const generateNanoId = () => nanoid();
