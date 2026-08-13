require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const ChatConversation = require('./models/ChatConversation');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contactdb')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Bạn là Sac-bee, trợ lý ảo thân thiện và chuyên nghiệp của SẮC - thương hiệu thời trang Việt phục và áo dài cao cấp tại Việt Nam.

Thông tin về SẮC:
- SẮC chuyên thiết kế và sản xuất áo dài, Việt phục, trang phục truyền thống và phụ kiện lấy cảm hứng từ văn hóa Việt Nam
- Hotline: 0812 059 720
- Email: sac.support@gmail.com
- SẮC giao hàng toàn quốc, thời gian 1-5 ngày tùy khu vực
- Miễn phí giao hàng cho đơn từ 500.000₫
- Chính sách đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất

Nhiệm vụ của bạn:
1. Tư vấn sản phẩm áo dài, Việt phục, phụ kiện của SẮC
2. Hỗ trợ khách hàng về kích cỡ, chất liệu, cách bảo quản trang phục
3. Giải đáp thắc mắc về đơn hàng, giao hàng, đổi trả
4. Dùng tiếng Việt tự nhiên, thân thiện, lịch sự
5. Giữ câu trả lời ngắn gọn, súc tích (tối đa 3-4 câu)
6. Khi gợi ý sản phẩm, trả lời 1 câu ngắn giới thiệu, danh sách sản phẩm sẽ hiển thị riêng bên dưới`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'tôi', 'muốn', 'cần', 'mua', 'tìm', 'cho', 'xem', 'gợi', 'ý', 'sản', 'phẩm',
  'về', 'một', 'số', 'vài', 'và', 'hoặc', 'có', 'là', 'được', 'không', 'bạn',
  'hãy', 'giúp', 'với', 'của', 'các', 'những', 'đây', 'này',
]);

function extractKeywords(msg) {
  return msg
    .replace(/[^a-zA-ZÀ-ỹ\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 4);
}

function hasBodyMeasurementInfo(msg) {
  const m = msg.toLowerCase();
  const hasHeight = /(1\.?[4-9][0-9]|[12][0-9]{2})\s*cm|1\.[4-9][0-9]\s*m|chiều\s*cao/.test(m);
  const hasWeight = /([3-9][0-9]|1[0-4][0-9])\s*kg|cân\s*nặng/.test(m);
  return hasHeight || hasWeight;
}

function generateFallback(msg, recentMessages = []) {
  const m = msg.toLowerCase();
  const lastAssistantText = [...recentMessages]
    .reverse()
    .find((x) => x.role === 'assistant')?.content?.toLowerCase() || '';

  const isSizeFollowUp =
    hasBodyMeasurementInfo(m) &&
    /(size|kích\s*cỡ|chiều\s*cao|cân\s*nặng|số\s*đo)/.test(lastAssistantText);

  if (isSizeFollowUp) {
    return `Cảm ơn bạn đã liên hệ! Sac-bee đã nhận thông tin tư vấn size: "${msg}".\n\nĐể được hỗ trợ chính xác hơn, bạn có thể:\n- Gọi hotline: 0812 059 720\n- Email: sac.support@gmail.com\n- Hoặc để lại thêm số đo (vai, ngực, eo, mông) để Sac-bee tư vấn chi tiết hơn.`;
  }

  if (/áo\s*dài|việt\s*phục|trang\s*phục|bộ\s*sưu\s*tập|thiết\s*kế/.test(m))
    return 'Cảm ơn bạn đã quan tâm SẮC. Hiện bên mình có nhiều mẫu áo dài và Việt phục theo phong cách truyền thống lẫn cách tân. Bạn muốn Sac-bee gợi ý theo dịp mặc, màu sắc hay mức giá?';
  if (/size|kích\s*cỡ|số\s*đo|vòng\s*ngực|chiều\s*cao/.test(m))
    return 'Cảm ơn bạn đã liên hệ tư vấn size. Bạn vui lòng gửi giúp Sac-bee chiều cao, cân nặng và số đo cơ bản (nếu có) để mình gợi ý size phù hợp nhất.';
  if (/giá|price|bao\s*nhiêu|ngân\s*sách/.test(m))
    return 'Giá sản phẩm được hiển thị trực tiếp trên trang chi tiết. Nếu bạn cho Sac-bee biết ngân sách dự kiến, mình có thể gợi ý nhanh các mẫu phù hợp.';
  if (/giao\s*hàng|ship|vận\s*chuyển|nhận\s*hàng/.test(m))
    return 'SẮC hỗ trợ giao hàng toàn quốc, thời gian dự kiến 1-5 ngày tùy khu vực. Đơn từ 500.000₫ sẽ được miễn phí vận chuyển.';
  if (/đổi\s*trả|hoàn\s*tiền|lỗi|hỏng/.test(m))
    return 'SẮC hỗ trợ đổi trả trong 7 ngày với sản phẩm lỗi từ nhà sản xuất. Bạn vui lòng gửi mã đơn để Sac-bee kiểm tra và hỗ trợ nhanh hơn.';
  if (/liên\s*hệ|hotline|email|hỗ\s*trợ|cskh/.test(m))
    return 'Cảm ơn bạn đã liên hệ!\n\nĐể được hỗ trợ tốt hơn, bạn có thể:\n- Gọi hotline: 0812 059 720\n- Email: sac.support@gmail.com\n- Hoặc truy cập trang "Hỗ trợ" để xem các câu hỏi thường gặp!';
  if (/chất\s*liệu|vải|cotton|lụa|tơ/.test(m))
    return 'SẮC sử dụng nhiều chất liệu như lụa tơ tằm, voan, nhung và cotton tùy thiết kế. Bạn muốn Sac-bee gợi ý theo chất liệu nào để dễ chọn hơn?';
  if (/bảo\s*quản|giặt|hấp/.test(m))
    return 'Với áo dài và Việt phục, SẮC khuyến nghị giặt tay hoặc giặt khô, treo thẳng và tránh nắng gắt để giữ phom dáng và màu sắc tốt nhất.';
  if (/cảm\s*ơn|thank/.test(m))
    return 'Rất hân hạnh được hỗ trợ bạn. Nếu cần thêm thông tin về sản phẩm, size hoặc đơn hàng, bạn cứ nhắn Sac-bee nhé!';

  return `Cảm ơn bạn đã liên hệ! Sac-bee đã nhận câu hỏi: "${msg}".\n\nĐể được hỗ trợ tốt hơn, bạn có thể:\n- Gọi hotline: 0812 059 720\n- Email: sac.support@gmail.com\n- Hoặc mô tả rõ hơn nhu cầu (sản phẩm, size, đơn hàng) để Sac-bee hỗ trợ chính xác hơn.`;
}

// ─── POST /chat/message ───────────────────────────────────────────────────────
app.post('/chat/message', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
    }

    const sessionKey = userId || req.ip || `anon_${Date.now()}`;

    let conversation = await ChatConversation.findOne({ sessionId: sessionKey });
    if (!conversation) {
      conversation = new ChatConversation({ sessionId: sessionKey, userId: userId || null, messages: [] });
    }

    conversation.messages.push({ role: 'user', content: message.trim(), timestamp: new Date() });

    const recentMessages = conversation.messages.slice(-6);

    // ── Detect product request ──
    const lower = message.toLowerCase();
    const isProductRequest =
      /gợi\s*ý|đề\s*xuất|tìm\s*sản\s*phẩm|sản\s*phẩm|áo\s*dài|việt\s*phục|phụ\s*kiện|muốn\s*mua|cần\s*mua|cho\s*xem/.test(lower);

    let suggestedProducts = [];
    if (isProductRequest) {
      try {
        const keywords = extractKeywords(lower);
        let query = {};
        if (keywords.length > 0) {
          query.$or = keywords.flatMap((k) => [
            { product_name: { $regex: k, $options: 'i' } },
            { product_dept: { $regex: k, $options: 'i' } },
            { material: { $regex: k, $options: 'i' } },
            { short_description: { $regex: k, $options: 'i' } },
          ]);
        }
        suggestedProducts = await Product.find(query)
          .limit(6)
          .select('_id product_name unit_price discount images product_dept')
          .lean();

        // fallback: lấy sản phẩm đầu nếu keyword không match
        if (suggestedProducts.length === 0) {
          suggestedProducts = await Product.find({})
            .limit(6)
            .select('_id product_name unit_price discount images product_dept')
            .lean();
        }
      } catch (productErr) {
        console.error('[Chat] Product search error:', productErr.message);
      }
    }

    // ── Fallback response ──
    let aiResponse = '';
    console.log('[Chat] Using improved fallback response (Gemini API disabled)');
    aiResponse = generateFallback(message.trim(), recentMessages);

    conversation.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
    conversation.updatedAt = new Date();
    await conversation.save();

    // ── Normalize products for frontend ──
    const products = suggestedProducts.map((p) => ({
      _id: p._id,
      name: p.product_name,
      category: p.product_dept || '',
      price: p.unit_price,
      image: p.images?.[0] || '',
    }));

    res.json({
      success: true,
      data: {
        message: aiResponse,
        products: products.length > 0 ? products : undefined,
      },
    });
  } catch (err) {
    console.error('[Chat] Server error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── GET /chat/history ────────────────────────────────────────────────────────
app.get('/chat/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json({ success: true, data: { messages: [] } });

    const conversation = await ChatConversation.findOne({ sessionId: userId });
    if (!conversation) return res.json({ success: true, data: { messages: [] } });

    res.json({ success: true, data: { messages: conversation.messages } });
  } catch (err) {
    console.error('[Chat] History error:', err);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`SẮC Chat Server (Sac-bee) running on port ${PORT}`);
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('[Chat] ⚠️  GEMINI_API_KEY chưa được cấu hình — đang dùng fallback response');
  }
});
