const { GoogleGenAI } = require('@google/genai');
const { OAuth2Client } = require('google-auth-library');
const coreTools = require('../../plugins/core_tools');
const manifest = require('../../plugins/manifest.json');

// ฐานข้อมูลในหน่วยความจำระดับ Runtime (ทำงานร่วมกับ LocalStorage ฝั่งหน้าเว็บ)
const memoryDB = {
  users: {},
  customAIs: []
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET: ส่งค่า Config และรายการ Plugin จาก GitHub ให้หน้า index
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        manifest,
        publicAIs: memoryDB.customAIs
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { action } = body;

    // 1. ยืนยันตัวตนด้วย Google OAuth Client ID จริง
    if (action === 'google_auth') {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: body.credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        provider: 'google_oauth',
        lastLogin: new Date().toISOString()
      };
      memoryDB.users[payload.email] = user;
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'connected', user, manifest }) };
    }

    // 2. เข้าสู่ระบบด้วย Email
    if (action === 'email_auth') {
      if (!body.email) throw new Error('กรุณาระบุ Email');
      const user = {
        email: body.email,
        name: body.email.split('@')[0],
        provider: 'email',
        lastLogin: new Date().toISOString()
      };
      memoryDB.users[body.email] = user;
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'connected', user, manifest }) };
    }

    // 3. สร้าง AI ตัวลูกและบันทึกเข้าระบบสาธารณะ
    if (action === 'spawn_ai') {
      const agent = coreTools.buildCustomAgentConfig(body.aiName, body.systemPrompt, body.modelVersion);
      agent.owner = body.email;
      memoryDB.customAIs.push(agent);
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'created', agent, allAIs: memoryDB.customAIs }) };
    }

    // 4. เรียกใช้งาน Plugin-Gemini (รองรับ Google Search + Public API URL + Custom AI)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let finalPrompt = body.prompt;

    // หากมีการแนบ Public API URL ให้ดึงข้อมูลมาให้ Gemini วิเคราะห์ร่วมด้วย
    if (body.publicApiUrl) {
      const apiData = await coreTools.fetchPublicApi(body.publicApiUrl);
      finalPrompt += `\n\n[ข้อมูลจาก Public API (${body.publicApiUrl})]:\n${JSON.stringify(apiData).slice(0, 4000)}`;
    }

    const config = {
      systemInstruction: body.customSystemPrompt || "คุณคือ Plugin-Gemini Borderless World AI พัฒนาโดย TPS Group (ธันวา ภูปิงบุตร) เชื่อมต่อระบบ Vela Core"
    };

    if (body.useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: body.modelVersion || 'gemini-2.5-flash',
      contents: finalPrompt,
      config
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: response.text,
        modelUsed: body.modelVersion || 'gemini-2.5-flash',
        activeModules: manifest.modules.map(m => m.name)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

