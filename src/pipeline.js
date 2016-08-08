import {saveSurvey} from "steps/save-survey";
import {saveQuestionnaire} from "steps/save-questionnaire";

export default async function pipeline (event) {

    const element = event.data.element;

    switch (element.type) {
    case "survey":
        await saveSurvey(element);
        break;
    case "questionnaire":
        await saveQuestionnaire(element);
        break;
    }

    return null;
}
