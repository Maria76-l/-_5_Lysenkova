// To display predictions, this app has:
// 1. A video that shows a feed from the user's webcam
// 2. A canvas that appears over the video and shows predictions
// When the page loads, a user is asked to give webcam permission.
// After this happens, the model initializes and starts to make predictions
// On the first prediction, an initialiation step happens in detectFrame()
// to prepare the canvas on which predictions are displayed.
//Блок объявления переменных
var bounding_box_colors = {};
//Словарь для хранения цветов ограничивающих рамок для каждого класса объектов
var user_confidence = 0.6;
//Порог уверенности для отображения предсказаний (по умолчанию 60%)
// Update the colors in this list to set the bounding box colors
var color_choices = [
  "#C7FC00",
  "#FF00FF",
  "#8622FF",
  "#FE0056",
  "#00FFCE",
  "#FF8000",
  "#00B7EB",
  "#FFFF00",
  "#0E7AFE",
  "#FFABAB",
  "#0000FF",
  "#CCCCCC",
];
// Массив цветов для ограничивающих рамок
var canvas_painted = false;
// Флаг, указывающий, была ли нарисована канвас
var canvas = document.getElementById("video_canvas");
// Получаем элемент canvas по его идентификатору
var ctx = canvas.getContext("2d");
// Получаем контекст рисования для canvas

const inferEngine = new inferencejs.InferenceEngine();
// Создаем экземпляр класса InferenceEngine из библиотеки inferencejs
// InferenceEngine управляет загрузкой модели и выполнением предсказаний
var modelWorkerId = null;
// Идентификатор рабочего процесса модели, который будет использоваться для выполнения предсказаний
//Блок обнаружения объектов на видео
function detectFrame() {
  if (!modelWorkerId) return requestAnimationFrame(detectFrame);
// Если модель не загружена, повторяем запрос на следующем кадре
  inferEngine.infer(modelWorkerId, new inferencejs.CVImage(video)).then(function(predictions) {

    if (!canvas_painted) {
      //Первичная инициализация канваса (выполняется один раз)
      var video_start = document.getElementById("video1");
    // Получаем элемент видео по его идентификатору
      canvas.top = video_start.top;
      canvas.left = video_start.left;
      canvas.style.top = video_start.top + "px";
      canvas.style.left = video_start.left + "px";
      canvas.style.position = "absolute";
      video_start.style.display = "block";
      canvas.style.display = "absolute";
      // Устанавливаем стили для канваса и видео
      canvas_painted = true;
      // Устанавливаем флаг, что канвас был нарисован
      var loading = document.getElementById("loading");
      loading.style.display = "none";
    }
    requestAnimationFrame(detectFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Очищаем канвас перед рисованием новых предсказаний
    if (video) {
      drawBoundingBoxes(predictions, ctx)
    }
    // Если видео доступно, рисуем ограничивающие рамки на канвасе
  });
}
//Блок отрисовки ограничивающих рамок
function drawBoundingBoxes(predictions, ctx) {
 

  for (var i = 0; i < predictions.length; i++) {
    // Перебираем все предсказания
    var confidence = predictions[i].confidence;

    console.log(user_confidence)

    if (confidence < user_confidence) {
      continue
    }
    // Фильтрация по порогу уверенности: предсказания ниже порога пропускаются
    if (predictions[i].class in bounding_box_colors) {
      ctx.strokeStyle = bounding_box_colors[predictions[i].class];
      // Если класс уже есть в словаре, используем сохранённый цвет
    } else {
      var color =
        color_choices[Math.floor(Math.random() * color_choices.length)];
      ctx.strokeStyle = color;
     // Если класс новый, выбираем случайный цвет из массива color_choices
      color_choices.splice(color_choices.indexOf(color), 1);
      // Удаляем выбранный цвет из массива, чтобы не использовать его повторно
      bounding_box_colors[predictions[i].class] = color;
    }

    var prediction = predictions[i];
    var x = prediction.bbox.x - prediction.bbox.width / 2;
    var y = prediction.bbox.y - prediction.bbox.height / 2;
    var width = prediction.bbox.width;
    var height = prediction.bbox.height;
    // Вычисляем координаты и размеры ограничивающей рамки
    ctx.rect(x, y, width, height);

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();

    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = "4";
    ctx.strokeRect(x, y, width, height);
    ctx.font = "25px Arial";
    ctx.fillText(prediction.class + " " + Math.round(confidence * 100) + "%", x, y - 10);
    // Рисуем ограничивающую рамку и текст с классом и уверенностью предсказания
  }
}
   //Блок инициализации веб-камеры
function webcamInference() {
  
  var loading = document.getElementById("loading");
  loading.style.display = "block";
  // Отображаем сообщение о загрузке
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    // Запрашиваем доступ к веб-камере устройства
    .then(function(stream) {
      // Если доступ получен, создаем элемент видео и устанавливаем его источник на поток с камеры
      video = document.createElement("video");
      video.srcObject = stream;
      video.id = "video1";

      video.style.display = "none";
      // Скрывает видео до полной загрузки метаданных
      video.setAttribute("playsinline", "");
      // Устанавливает атрибут playsinline для воспроизведения видео без перехода в полноэкранный режим на iOS
      document.getElementById("video_canvas").after(video);
      // Добавляет видео после элемента canvas с идентификатором video_canvas
      video.onloadedmetadata = function() {
        video.play();
      }

      // После загрузки метаданных (размер кадра, длительность) — начинает воспроизведение видео
      video.onplay = function() {
        // После загрузки метаданных (размер кадра, длительность) — начинает воспроизведение
        height = video.videoHeight;
        width = video.videoWidth;
    

        video.width = width;
        video.height = height;
        video.style.width = 640 + "px";
        video.style.height = 480 + "px";

        canvas.style.width = 640 + "px";
        canvas.style.height = 480 + "px";
        canvas.width = width;
        canvas.height = height;
        // Устанавливает размеры видео и канваса в соответствии с размерами кадра
        document.getElementById("video_canvas").style.display = "block";
      };

      ctx.scale(1, 1);
      // Устанавливает масштаб контекста рисования на 1, чтобы избежать искажений
      inferEngine.startWorker(MODEL_NAME, MODEL_VERSION, publishable_key, [{ scoreThreshold: CONFIDENCE_THRESHOLD }])
        .then((id) => {
          modelWorkerId = id;
          // Загружает модель и получает идентификатор рабочего процесса
          detectFrame();
        })
        .catch(function(err) {
          // Обработка ошибок загрузки модели
          console.log("Ошибка загрузки модели:", err);
          var loading = document.getElementById("loading");
          loading.textContent = "Ошибка загрузки модели: " + (err.message || err);
          loading.style.color = "red";
          loading.style.display = "block";
        });
    })
    .catch(function(err) {
      // Обработка ошибок доступа к камере
      console.log(err);
      var loading = document.getElementById("loading");
  //  Блок обработки ошибок доступа к камере
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        loading.textContent = "Ошибка: веб-камера не найдена. Подключите камеру и обновите страницу.";
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        loading.textContent = "Ошибка: доступ к камере запрещён. Разрешите доступ к камере в настройках браузера.";
      } else {
        loading.textContent = "Ошибка камеры: " + err.message;
      }
      loading.style.color = "red";
      loading.style.display = "block";
    });
}
// Блок изменения порога уверенности
function changeConfidence () {
  user_confidence = document.getElementById("confidence").value / 100;
  // Обновляет порог уверенности на основе значения ползунка
}

document.getElementById("confidence").addEventListener("input", changeConfidence);
// Добавляет обработчик события input для ползунка, который вызывает функцию changeConfidence при изменении значения

webcamInference();
 // Запускает функцию webcamInference при загрузке страницы