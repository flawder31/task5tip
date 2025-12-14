// Кастомный middleware для логирования
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Логируем входящий запрос
  console.log('\n📥 Входящий запрос:');
  console.log(`   Метод: ${req.method}`);
  console.log(`   URL: ${req.originalUrl}`);
  console.log(`   IP: ${req.ip}`);
  console.log(`   User-Agent: ${req.get('User-Agent')}`);
  
  if (Object.keys(req.body).length > 0) {
    console.log(`   Тело запроса:`, JSON.stringify(req.body, null, 2));
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log(`   Query параметры:`, req.query);
  }
  
  // Перехватываем отправку ответа
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    console.log('\n📤 Исходящий ответ:');
    console.log(`   Статус: ${res.statusCode}`);
    console.log(`   Длительность: ${duration}ms`);
    console.log(`   Content-Type: ${res.get('Content-Type')}`);
    
    if (res.statusCode >= 400) {
      console.log(`   ❌ Ошибка: ${res.statusCode}`);
    } else {
      console.log(`   ✅ Успех: ${res.statusCode}`);
    }
    
    console.log('='.repeat(50));
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = loggerMiddleware;