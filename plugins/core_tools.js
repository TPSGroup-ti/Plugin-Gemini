// โมดูลความสามารถเสริมของ Plugin-Gemini (เพิ่มฟังก์ชันใหม่ๆ ในไฟล์นี้บน GitHub ได้ตลอด)
const coreTools = {
  // ดึงข้อมูลจาก Public API สาธารณะภายนอก
  async fetchPublicApi(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      return { error: "ไม่สามารถเชื่อมต่อ Public API ได้: " + err.message };
    }
  },

  // สร้างโครงสร้าง AI ตัวใหม่ให้ผู้ใช้
  buildCustomAgentConfig(aiName, systemPrompt, modelVersion) {
    return {
      agentId: "PG-" + Date.now(),
      name: aiName,
      model: modelVersion || "gemini-2.5-flash",
      instruction: systemPrompt
    };
  }
};

module.exports = coreTools;

