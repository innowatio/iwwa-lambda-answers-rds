import {
    insertSurvey,
    insertSurveyQuestion,
    insertSurveyAnswer,
    findUser
} from "services/db";
import {generateUniqueQuestionId} from "utils";
import {map} from "bluebird";


export async function saveSurvey (element) {
    const userId = (await findUser(element.userId))[0].id;

    return map(element.answers, async answer => {
        const question = answer.question;
        const questionId = generateUniqueQuestionId(element.questionId, answer.id);

        // answerText
        const {id} = await insertSurveyAnswer(answer.answer);

        // questionCategory, questionText, surveyId
        await insertSurveyQuestion(questionId, element.category, question.text);

        // userId, answerId, questionId, date
        await insertSurvey(userId, id, questionId, answer.timestamp);

    });

}
