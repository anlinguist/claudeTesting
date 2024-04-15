import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

class AIRequestHandler {
  constructor() {
    this.openaiModels = ['gpt-3.5-turbo-0125', 'gpt-4-0125-preview'];
    this.anthropicModels = ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
    this.data = [
        {
          "user_message": "The novel coronavirus, SARS-CoV-2, is a highly virulent pathogen that has caused a global pandemic of COVID-19. The virus is transmitted via respiratory droplets and can cause severe acute respiratory syndrome, leading to high morbidity and mortality rates, particularly among elderly and immunocompromised individuals.",
          "style_target": "Style: Simplify, Target: 5th Grader"
        },
        {
          "user_message": "The project manager was on cloud nine after the successful product launch, but soon realized that the team had bitten off more than they could chew when they encountered numerous bugs and issues.",
          "style_target": "Style: Translate, Target: Spanish"
        },
        {
          "user_message": "The company's quarterly financial report indicated a 5% increase in revenue compared to the previous year. The CEO attributed this growth to the successful implementation of new marketing strategies and the dedication of the sales team.",
          "style_target": "Style: Tone, Target: Humorous"
        },
        {
          "user_message": "To be, or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
          "style_target": "Style: Reword, Target: A Pirate"
        },
        {
          "user_message": "The Industrial Revolution, which took place from the 18th to 19th centuries, was a period during which predominantly agrarian, rural societies in Europe and America became industrial and urban. Prior to the Industrial Revolution, which began in Britain in the late 1700s, manufacturing was often done in people's homes, using hand tools or basic machines. Industrialization marked a shift to powered, special-purpose machinery, factories, and mass production. The iron and textile industries, along with the development of the steam engine, played central roles in the Industrial Revolution, which also saw improved systems of transportation, communication, and banking. While industrialization brought about an increased volume and variety of manufactured goods and an improved standard of living for some, it also resulted in often grim employment and living conditions for the poor and working classes.",
          "style_target": "Style: Simplify, Target: 5th Grader"
        },
        {
          "user_message": "The Battle of Gettysburg, fought from July 1-3, 1863, was a turning point in the American Civil War. Union forces, led by General George Meade, defeated Confederate forces under General Robert E. Lee. The battle resulted in 51,000 casualties, with 23,000 Union and 28,000 Confederate soldiers killed, wounded, or missing.",
          "style_target": "Style: Reword, Target: A mob boss"
        },
        {
          "user_message": "Glaucoma is a group of eye disorders that can damage the optic nerve, leading to vision loss and blindness. The most common form of glaucoma is primary open-angle glaucoma (POAG), which is characterized by increased intraocular pressure (IOP) due to an imbalance in the production and drainage of aqueous humor.",
          "style_target": "Style: Simplify, Target: A general audience"
        },
        {
          "user_message": "El cambio climático es uno de los mayores desafíos que enfrenta la humanidad en la actualidad. Los científicos advierten que si no se toman medidas urgentes para reducir las emisiones de gases de efecto invernadero, las consecuencias podrían ser catastróficas.",
          "style_target": "Style: Translate, Target: Russian"
        },
        {
          "user_message": "This restraunt had the worst service ever! The waiter was rude and got our orders wrong twice. The food was cold and bland, def not worth the high prices. I won't be coming back here again, and I don't recommend it to anyone else either!",
          "style_target": "Style: Proofread and edit, Target: Standard English"
        }
    ],
    this.resultsDir = 'results';
    this.createResultsDirectory();
  }

  createResultsDirectory() {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir);
    }
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/:/g, '-');
  }

  async runSingleTest() {
    const promptData = this.data[0];
    const openaiModel = this.openaiModels[0];
    const anthropicModel = this.anthropicModels[0];

    const timestamp = this.getTimestamp();
    const openaiOutputFile = path.join(this.resultsDir, `output_openai_${timestamp}.csv`);
    const anthropicOutputFile = path.join(this.resultsDir, `output_anthropic_${timestamp}.csv`);
  
    fs.writeFileSync(openaiOutputFile, `Model Family,Model\nOpenAI,${openaiModel}\n\nUser Message,Style/Target,Response\n`);
    fs.writeFileSync(anthropicOutputFile, `Model Family,Model\nAnthropic,${anthropicModel}\n\nUser Message,Style/Target,Response\n`);
  
    await this.runOpenAIRequest(promptData, openaiModel, openaiOutputFile);
    await this.runAnthropicRequest(promptData, anthropicModel, anthropicOutputFile);
  }

  async runOpenAIRequests() {
    const timestamp = this.getTimestamp();
    const outputFile = path.join(this.resultsDir, `output_openai_${timestamp}.csv`);
    fs.writeFileSync(outputFile, 'Model Family,Model\nOpenAI,\n\nUser Message,Style/Target,Response\n');

    for (const model of this.openaiModels) {
        fs.appendFileSync(outputFile, `OpenAI,${model}\n`);
        for (const promptData of this.data) {
          await this.runOpenAIRequest(promptData, model, outputFile);
        }
        fs.appendFileSync(outputFile, '\n');
      }
  }

  async runAnthropicRequests() {
    const timestamp = this.getTimestamp();
    const outputFile = path.join(this.resultsDir, `output_anthropic_${timestamp}.csv`);
    fs.writeFileSync(outputFile, 'Model Family,Model\nAnthropic,\n\nUser Message,Style/Target,Response\n');

    for (const model of this.anthropicModels) {
      fs.appendFileSync(outputFile, `Anthropic,${model}\n`);
      for (const promptData of this.data) {
        await this.runAnthropicRequest(promptData, model, outputFile);
      }
      fs.appendFileSync(outputFile, '\n');
    }
  }
  

  async runOpenAIRequest(promptData, model, outputFile) {
    const startTime = Date.now();
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: 'Change the text using the given style and target.' },
        { role: 'user', content: promptData.user_message },
        { role: 'user', content: promptData.style_target }
      ]
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
        const result = await response.json();
        const modelResponse = result.choices[0].message.content;
        const escapedResponse = JSON.stringify(modelResponse);
        const duration = Date.now() - startTime;
        fs.appendFileSync(outputFile, `"${promptData.user_message}","${promptData.style_target}",${escapedResponse},${duration}\n`);
        console.log(`OpenAI - Response received for model: ${model}, prompt: ${promptData.user_message}`);
      } catch (error) {
        console.error(`OpenAI - Error for model: ${model}, prompt: ${promptData.user_message}`, error);
      }
  }

  async runAnthropicRequest(promptData, model, outputFile) {
    const startTime = Date.now();
    const requestBody = {
      model: model,
      system: 'Change the text using the given style and target.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptData.user_message },
            { type: 'text', text: promptData.style_target }
          ]
        }
      ],
      max_tokens: 1000
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', requestOptions);
        const result = await response.json();
        let modelResponse;
        try {
            modelResponse = result.content[0].text;
        } catch {
            modelResponse = result
        }
        const escapedResponse = JSON.stringify(modelResponse);
        const duration = Date.now() - startTime;
        fs.appendFileSync(outputFile, `"${promptData.user_message}","${promptData.style_target}",${escapedResponse},${duration}\n`);
        console.log(`Anthropic - Response received for model: ${model}, prompt: ${promptData.user_message}`);
      } catch (error) {
        console.error(`Anthropic - Error for model: ${model}, prompt: ${promptData.user_message}`, error);
      }
  }
}

(async () => {
  const handler = new AIRequestHandler();

  const args = process.argv.slice(2);
  if (args.includes('--single-test')) {
    await handler.runSingleTest();
  } else if (args.includes('--openai-only')) {
    await handler.runOpenAIRequests();
  } else if (args.includes('--anthropic-only')) {
    await handler.runAnthropicRequests();
  } else {
    await handler.runOpenAIRequests();
    await handler.runAnthropicRequests();
  }
})();