import {
    findUser,
    findSite
} from "services/db";

export async function skip (element) {
    const userId = element.userId;
    const siteId = element.siteId;

    const userOnDB = await findUser(userId);
    const siteOnDB = await findSite(siteId);

    return userOnDB.length === 0 || (element.type === "questionnaire" && siteOnDB.length === 0);
}
