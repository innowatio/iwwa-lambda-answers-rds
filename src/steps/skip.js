import log from "services/logger";
import {
    findUser,
    findSite
} from "services/db";

export async function skip (element) {
    const userId = element.userId;
    const siteId = element.siteId;

    const userOnDB = await findUser(userId);
    const siteOnDB = await findSite(siteId);

    if (userOnDB.length === 0) {
        log.info(`User not found '${userId}'`);
        return true;
    }
    if (element.type === "questionnaire" && siteOnDB.length === 0) {
        log.info(`Site not found '${siteId}'`);
        return true;
    }

    return false;
}
