import {
    insertQuestionnaire,
    insertQuestionnaireQuestion,
    insertQuestionnaireAnswer,
    findUser,
    findSite
} from "services/db";
import {generateUniqueQuestionId} from "utils";
import {map} from "bluebird";


export async function saveQuestionnaire (element) {
    const userId = (await findUser(element.userId))[0].id;
    const meterId = (await findSite(element.siteId))[0].id;

    return map(element.answers, async answer => {
        const question = answer.question;
        const questionId = generateUniqueQuestionId(element.questionId, answer.id);

        // answerText
        const {id} = await insertQuestionnaireAnswer(answer.answer);

        // questionCategory, questionText, surveyId
        await insertQuestionnaireQuestion(questionId, element.category, question.text);

        // userId, meterId, answerId, questionId, date
        await insertQuestionnaire(userId, meterId, id, questionId, answer.timestamp);

    });

}
