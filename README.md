## WebRank Insight Documentation

# WebRank Insight - Chrome Extension

A lightweight Chrome extension that displays website traffic and ranking insights using public SimilarWeb data sources.

### 💡 Cách Reset “Weekly Usage Limit” của Similarweb Extension

Tiện ích **Similarweb - Website Traffic & SEO Checker** có cơ chế giới hạn số lần check mỗi tuần (“Weekly usage limit”).  
Nếu bạn muốn xóa bộ đếm này để reset lượt check, có thể thực hiện trực tiếp trong Chrome, không cần xóa hay cài lại extension.

#### 🧭 Bước 1: Mở Developer Tools (F12)

Tại bất kỳ trang web nào, nhấn `F12` hoặc `Ctrl` + `Shift` + `I` để mở **DevTools**.  
Chuyển sang tab **Application** *(nếu không thấy, bấm vào mũi tên `>>` để hiện thêm)*.

📸 **Hình minh họa**: **ScreenShot_20251030211437.png**

#### 💾 Bước 2: Vào Storage → Extension Storage

Trong cột bên trái, tìm mục **Storage → Extension Storage**.  

Danh sách các tiện ích sẽ hiện ra — tìm **Similarweb** *(ID thường là hoklmmgfnpapgjgcpechhaamimifchmp)*.  
Nhấn chuột phải → chọn **Sync** để tải lại dữ liệu.  

Sau đó nhấn chuột phải lần nữa → chọn **Clear** để xóa.  

📸 **Hình minh họa**: **ScreenShot_20251030211519.png**

#### ✅ Kết quả

Số lần check trong tuần (“Weekly usage”) được reset về `0`, bạn có thể dùng Similarweb lại như mới cài 👌

#### ⚠️ Lưu ý

Cách này chỉ xóa dữ liệu cục bộ, không ảnh hưởng tài khoản hoặc máy chủ API.

---

![WebRank Insight](https://raw.githubusercontent.com/bcat95/WebRank-Insight-Traffic-SEO-Checker/refs/heads/main/images/og.png)

### Features

- **Website Rankings**: Global Rank, Country Rank, Category Rank  
- **Traffic & Engagement**: Monthly Visits, Bounce Rate, Pages per Visit, Average Duration  
- **Traffic Sources**: Top traffic sources breakdown  
- **Clean Interface**: Bootstrap-based responsive design

### Installation

1. **Download** or **clone** this repository.  
2. Open Chrome and go to `chrome://extensions/`.  
3. Enable **Developer mode** *(top right corner)*.  
4. Click **Load unpacked** and select the extension folder.  
5. The extension icon will appear in your Chrome toolbar.

### Usage

1. Navigate to any website.  
2. Click the **WebRank Insight** icon in the toolbar.  
3. Instantly view the website’s estimated traffic and ranking data.

> ℹ️ **Note**: Data is fetched from publicly available SimilarWeb endpoints for demonstration and educational purposes only.

### Requirements

- **Google Chrome browser** *(Manifest V3 compatible)*  
- **Internet connection** for fetching live data.

### File Structure