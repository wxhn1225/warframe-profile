use regex::Regex;
use reqwest::Client;
use std::time::Duration;

#[derive(serde::Serialize)]
struct ParsedLogin {
    account_id: String,
    display_name: String,
}

#[tauri::command]
async fn parse_account_id(content: String) -> Result<ParsedLogin, String> {
    let re = Regex::new(r"Logged in ([^\(]+) \(([a-f0-9]+)\)").map_err(|e| e.to_string())?;
    for line in content.lines() {
        if let Some(caps) = re.captures(line) {
            return Ok(ParsedLogin {
                display_name: caps[1].trim().to_string(),
                account_id: caps[2].to_string(),
            });
        }
    }
    Err("未在 EE.log 中找到登录记录，请确认文件正确".to_string())
}

#[tauri::command]
async fn auto_detect_log() -> Result<String, String> {
    let localappdata = std::env::var("LOCALAPPDATA")
        .map_err(|_| "无法读取 LOCALAPPDATA 环境变量".to_string())?;
    let path = std::path::Path::new(&localappdata)
        .join("Warframe")
        .join("EE.log");
    std::fs::read_to_string(&path)
        .map_err(|e| format!("无法读取 EE.log（{}）：{}", path.display(), e))
}

#[tauri::command]
async fn fetch_profile(account_id: String, platform: String) -> Result<String, String> {
    let base = match platform.as_str() {
        "pc" => "http://content.warframe.com",
        "ps4" => "http://content-ps4.warframe.com",
        "xb1" => "http://content-xb1.warframe.com",
        "swi" => "http://content-swi.warframe.com",
        "mob" => "http://content-mob.warframe.com",
        _ => return Err(format!("未知平台: {}", platform)),
    };

    let url = format!(
        "{}/dynamic/getProfileViewingData.php?playerId={}",
        base, account_id
    );

    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("创建请求客户端失败: {}", e))?;

    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    let status = resp.status();
    if status == 409 {
        return Err("此账号为国服账号，本工具仅支持国际服账号".to_string());
    }
    if status == 404 {
        return Err("未找到该账号，请确认账号 ID 是否正确".to_string());
    }
    if !status.is_success() {
        return Err(format!("服务器返回错误，请稍后重试（{}）", status.as_u16()));
    }

    resp.text()
        .await
        .map_err(|e| format!("读取响应失败: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            parse_account_id,
            auto_detect_log,
            fetch_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
