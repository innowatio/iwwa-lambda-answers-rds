import PgAsync from "pg-async";

import {
    DB_USER,
    DB_PASS,
    DB_URL,
    DB_NAME
} from "../config";

var db;
export function getClient () {
    if (!db) {
        db = new PgAsync(`postgres://${DB_USER}:${DB_PASS}@${DB_URL}/${DB_NAME}`);
    }
    return db;
}

export async function insertQuestionnaire (userId, siteId, answerId, questionId, date) {
    const db = await getClient();
    return db.query(`
        INSERT INTO questionnaire
            (user_app_id, meter_id, answer_id, question_id, date_answered)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING`,
        userId, siteId, answerId, questionId, date);
}

export async function insertQuestionnaireQuestion (id, questionCategory, questionText) {
    const db = await getClient();
    return db.query(`
        INSERT INTO question
            (id, question_category, question_text)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET
                question_category = EXCLUDED.question_category,
                question_text = EXCLUDED.question_text`,
        id, questionCategory, questionText);
}

export async function insertQuestionnaireAnswer (answerText) {
    const db = await getClient();
    return db.row(`
        INSERT INTO answer
            (answer_text)
            VALUES ($1)
            ON CONFLICT DO NOTHING
            RETURNING id`,
        answerText);
}

export async function insertSurvey (userId, answerId, questionId, date) {
    const db = await getClient();
    return db.query(`
        INSERT INTO survey
            (user_app_id, survey_answer_id, survey_question_id, date_answered)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING`,
        userId, answerId, questionId, date);
}

export async function insertSurveyQuestion (id, questionCategory, questionText) {
    const db = await getClient();
    return db.query(`
        INSERT INTO survey_question
            (id, question_category, question_text)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET
                question_category = EXCLUDED.question_category,
                question_text = EXCLUDED.question_text`,
        id, questionCategory, questionText);
}

export async function insertSurveyAnswer (answerText) {
    const db = await getClient();
    return db.row(`
        INSERT INTO survey_answer
            (answer_text)
            VALUES ($1)
            ON CONFLICT DO NOTHING
            RETURNING id`,
        answerText);
}

export async function findUser (userId) {
    const db = await getClient();
    return db.rows(`
        SELECT * FROM user_app WHERE id = $1`,
        userId);
}

export async function findSite (siteId) {
    const db = await getClient();
    return db.rows(`
        SELECT * FROM meter WHERE id = $1`,
        siteId);
}
