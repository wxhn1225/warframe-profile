use regex::Regex;
use reqwest::Client;
use std::io::{BufRead, BufReader};
use std::time::Duration;

#[derive(serde::Serialize)]
struct ParsedLogin {
    account_id: String,
    display_name: String,
}

fn parse_login_from_reader<R: std::io::Read>(reader: R) -> Result<ParsedLogin, String> {
    let re = Regex::new(r"Logged in ([^\(]+) \(([a-f0-9]{24})\)").map_err(|e| e.to_string())?;
    for line in BufReader::new(reader).lines() {
        let line = line.map_err(|e| e.to_string())?;
        if let Some(caps) = re.captures(&line) {
            return Ok(ParsedLogin {
                display_name: caps[1].trim().to_string(),
                account_id: caps[2].to_string(),
            });
        }
    }
    Err("未在 EE.log 中找到登录记录，请确认文件正确".to_string())
}

// 供前端上传文本内容时调用（前端只传前 2MB）
#[tauri::command]
async fn parse_account_id(content: String) -> Result<ParsedLogin, String> {
    parse_login_from_reader(content.as_bytes())
}

// 自动检测：流式读取本机 EE.log，找到即停，不加载整个文件
#[tauri::command]
async fn auto_detect_log() -> Result<ParsedLogin, String> {
    let localappdata = std::env::var("LOCALAPPDATA")
        .map_err(|_| "无法读取 LOCALAPPDATA 环境变量".to_string())?;
    let path = std::path::Path::new(&localappdata)
        .join("Warframe")
        .join("EE.log");
    let file = std::fs::File::open(&path)
        .map_err(|e| {
            // 只显示系统错误类型，不暴露具体路径
            let kind = e.kind();
            match kind {
                std::io::ErrorKind::NotFound => "未找到 EE.log，请确认已运行过 Warframe".to_string(),
                std::io::ErrorKind::PermissionDenied => "无权限读取 EE.log，请检查文件权限".to_string(),
                _ => "无法读取 EE.log，请尝试手动选择文件".to_string(),
            }
        })?;
    parse_login_from_reader(file)
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
        .map_err(|_| "初始化请求失败，请重试".to_string())?;

    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                "请求超时，请检查网络连接后重试".to_string()
            } else if e.is_connect() {
                "无法连接到服务器，请检查网络连接".to_string()
            } else {
                "网络请求失败，请检查网络连接后重试".to_string()
            }
        })?;

    let status = resp.status();
    if status == 409 {
        return Err("此账号为国服账号，本工具仅支持国际服账号".to_string());
    }
    if status == 404 {
        return Err("未找到该账号，请确认账号 ID 是否正确".to_string());
    }
    if !status.is_success() {
        return Err("服务器返回错误，请稍后重试".to_string());
    }

    resp.text()
        .await
        .map_err(|_| "读取响应失败，请重试".to_string())
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
