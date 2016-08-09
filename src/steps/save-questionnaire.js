import {
    insertQuestionnaire,
    insertQuestionnaireQuestion,
    insertQuestionnaireAnswer
} from "services/db";
import {generateUniqueQuestionId} from "utils";
import {map} from "bluebird";


export async function saveQuestionnaire (element) {
    const userId = element.userId;
    const meterId = element.siteId;

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
