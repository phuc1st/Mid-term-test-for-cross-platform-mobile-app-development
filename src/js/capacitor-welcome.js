import { SplashScreen } from '@capacitor/splash-screen';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { Screenshot } from 'capacitor-screenshot';

// Hàm kiểm tra và yêu cầu quyền thông báo
async function checkAndRequestNotificationPermission() {
  const { display } = await LocalNotifications.checkPermissions();
  if (display !== 'granted') {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      throw new Error('Quyền thông báo không được cấp!');
    }
  }
}

// Định nghĩa thành phần giao diện tùy chỉnh
window.customElements.define(
  'show-time-app',
  class extends HTMLElement {
    constructor() {
      super();

      SplashScreen.hide();

      const root = this.attachShadow({ mode: 'open' });

      root.innerHTML = `
    <style>
      :host {
        font-family: Arial, sans-serif;
        display: block;
        text-align: center;
        margin-top: 50px;
      }
      button {
        padding: 10px;
        margin: 5px;
        font-size: 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background-color: #45a049;
      }
      #result {
        margin-top: 20px;
        font-size: 18px;
        font-weight: bold;
      }
      #screenshot {
        margin-top: 20px;
        max-width: 100%;
        border: 1px solid #ccc;
        display: none;
      }
    </style>
    <h1>Hiển thị Thời Gian</h1>
    <button id="showTime">Hiển thị Thời Gian Hiện Tại</button>
    <button id="shareTime">Chia sẻ Thời Gian</button>
    <button id="takeScreenshot">Chụp Màn Hình</button>
    <p id="result"></p>
    <h2>Ảnh chụp màn hình hiển thị dưới đây</h2>
    <img id="screenshot" />
    `;
    }

    connectedCallback() {
      const showTimeButton = this.shadowRoot.querySelector('#showTime');
      const shareTimeButton = this.shadowRoot.querySelector('#shareTime');
      const takeScreenshotButton = this.shadowRoot.querySelector('#takeScreenshot');
      const resultParagraph = this.shadowRoot.querySelector('#result');
      const screenshotImage = this.shadowRoot.querySelector('#screenshot');

      // Hiển thị thời gian hiện tại
      showTimeButton.addEventListener('click', async () => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString();
        resultParagraph.textContent = `Thời gian hiện tại: ${currentTime}`;

        try {
          // Kiểm tra và yêu cầu quyền thông báo trước khi gửi
          await checkAndRequestNotificationPermission();

          // Gửi thông báo cục bộ
          await LocalNotifications.schedule({
            notifications: [
              {
                id: 1,
                title: 'Thời Gian Hiện Tại',
                body: `Bây giờ là ${currentTime}`,
              },
            ],
          });
        } catch (e) {
          console.error('Lỗi khi xử lý thông báo:', e);
          alert('Không thể gửi thông báo. Vui lòng kiểm tra cài đặt quyền!');
        }
      });

      // Chia sẻ thời gian hiện tại
      shareTimeButton.addEventListener('click', async () => {
        const timeText = resultParagraph.textContent;
        if (timeText) {
          try {
            await Share.share({
              title: 'Thời Gian Hiện Tại',
              text: timeText,
              dialogTitle: 'Chia sẻ Thời Gian',
            });
          } catch (e) {
            console.error('Lỗi khi chia sẻ thời gian:', e);
            alert('Không thể chia sẻ thời gian. Vui lòng thử lại!');
          }
        } else {
          alert('Vui lòng hiển thị thời gian trước khi chia sẻ!');
        }
      });

      // Chụp màn hình ứng dụng
      takeScreenshotButton.addEventListener('click', async () => {
        try {
          const result = await Screenshot.take();
          screenshotImage.src = `data:image/png;base64,${result.base64}`;
          screenshotImage.style.display = 'block'; 
        } catch (e) {
          console.error('Lỗi khi chụp màn hình:', e);
          alert('Không thể chụp màn hình. Vui lòng thử lại!');
        }
      });
    }
  },
);
