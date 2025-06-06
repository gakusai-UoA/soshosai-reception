import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

const Toast = ({ title, description, status, onClose, index }) => {
  return (
    <div
      style={{ bottom: `${4 + index * 5}rem` }}
      className={`fixed right-4 p-4 rounded-md shadow-lg ${
        status === "success" ? "bg-green-500" : "bg-red-500"
      } text-white transition-all duration-300`}
    >
      <h3 className="font-bold">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast, index) => (
        <Toast key={toast.id} {...toast} index={index} />
      ))}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="px-6 py-4">{children}</div>
        <div className="px-6 py-4 border-t">{footer}</div>
      </div>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState(1);
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaceInclude, setIsPlaceInclude] = useState(null);
  const [gender, setGender] = useState("");
  const [ipAddress, setIpAddress] = useState(
    Cookies.get("ipAddress") || "192.168.0.121"
  );
  const [printerPort, setPrinterPort] = useState(
    Cookies.get("printerPort") || "8008"
  );
  const [isIpModalOpen, setIsIpModalOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [toasts, setToasts] = useState([]);
  const ePosDevice = useRef();
  const printer = useRef();
  const STATUS_CONNECTED = "Connected";
  const [isConnecting, setIsConnecting] = useState(false);
  let gender_js = "";
  const [context, setContext] = useState(null);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [guestData, setGuestData] = useState([]);

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const canvasContext = canvas.getContext("2d");
    const img = new Image();
    img.src = "./sosho-logo.png";
    img.onload = () => {
      canvasContext.drawImage(img, 0, 0);
    };
    setContext(canvasContext);
  }, []);

  const [place, setPlace] = useState(null);
  useEffect(() => {
    const currentURL = window.location.pathname;
    if (currentURL.includes("west")) {
      setIsPlaceInclude(true);
      setPlace("west");
    } else if (currentURL.includes("front")) {
      setIsPlaceInclude(true);
      setPlace("front");
    } else if (currentURL.includes("new")) {
      setIsPlaceInclude(true);
      setPlace("new");
    } else {
      setIsPlaceInclude(false);
    }
  }, []);

  useEffect(() => {
    if (printer.current) {
      setIsIpModalOpen(false);
    }
  }, [printer.current]);

  const options = [
    { label: "未就学児", age: "pre-sc" },
    { label: "小学生", age: "els" },
    { label: "中学生", age: "jhs" },
    { label: "高校生", age: "hs" },
    { label: "大学生", age: "cs" },
    { label: "20代", age: "20s" },
    { label: "30代", age: "30s" },
    { label: "40代", age: "40s" },
    { label: "50代", age: "50s" },
    { label: "60代", age: "60s" },
    { label: "70代", age: "70s" },
    { label: "80代以上", age: "80s+" },
    { label: "回答しない", age: "no-answer" },
  ];

  const showToast = (title, description, status) => {
    const id = Date.now();
    const newToast = { id, title, description, status };
    setToasts((prevToasts) => [...prevToasts, newToast]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleKeyInput = (key) => {
    if (loading) return;
    if (step === 1) {
      if (key === "Enter" && numberOfPeople > 0) {
        setStep(2);
        setGuestData([]); // ゲストデータをリセット
        setCurrentMemberIndex(0);
      } else if (!isNaN(key)) {
        setNumberOfPeople((prev) => prev + key);
      } else if (key === "Backspace") {
        setNumberOfPeople((prev) => prev.slice(0, -1));
      }
    } else if (step === 2) {
      if (!isNaN(key)) {
        setAgeInput((prev) => prev + key);
      } else if (key === "Backspace") {
        setAgeInput((prev) => prev.slice(0, -1));
      } else if (key === "Enter" && ageInput) {
        const selectedAgeIndex = parseInt(ageInput) - 1;
        if (selectedAgeIndex >= 0 && selectedAgeIndex < options.length) {
          setSelectedOption(options[selectedAgeIndex]);
          setStep(3);
          setAgeInput("");
        }
      }
    } else if (step === 3) {
      if (key === "1") {
        setGender("male");
        gender_js = "male";
      } else if (key === "2") {
        setGender("female");
        gender_js = "female";
      } else if (key === "3") {
        setGender("no-answer");
        gender_js = "no-answer";
      } else if (key === "Enter") {
        if (gender_js) {
          const newGuestData = [
            ...guestData,
            {
              ageRange: selectedOption.age,
              gender: gender_js,
            },
          ];
          
          if (currentMemberIndex + 1 < parseInt(numberOfPeople)) {
            // 次のメンバーの入力へ
            setGuestData(newGuestData);
            setCurrentMemberIndex(currentMemberIndex + 1);
            setStep(2);
            setSelectedOption(null);
            setGender("");
            gender_js = "";
          } else {
            // 全メンバーの入力完了
            setGuestData(newGuestData); // 最後のメンバーのデータを追加
            setStep(4);
            handleSubmit(newGuestData); // 更新されたguestDataを渡す
          }
        }
      }
    }
  };

  const handleSubmit = async (finalGuestData) => {
    const currentTime = new Date().toISOString();
    const memberCount = parseInt(numberOfPeople);
    setLoading(true);

    try {
      // バリデーション
      if (!finalGuestData || finalGuestData.length === 0) {
        throw new Error("ゲストデータが必要です");
      }

      if (!memberCount || memberCount <= 0) {
        throw new Error("有効なグループ人数を入力してください");
      }

      if (finalGuestData.length !== memberCount) {
        throw new Error("グループ人数とゲストデータの数が一致しません");
      }

      const representativeData = finalGuestData[0];
      if (!representativeData.ageRange || !representativeData.gender) {
        throw new Error("代表者の年齢区分と性別は必須です");
      }

      // プリンターの接続確認
      if (!printer.current) {
        throw new Error("プリンターが接続されていません");
      }

      const cf_payload = {
        ageRange: representativeData.ageRange,
        gender: representativeData.gender,
        memberCount: memberCount,
        entrance: place === "new" ? "" : place,
        entranceTime: place === "new" ? "" : currentTime,
        guests: finalGuestData
      };

      const url = new URL(
        "https://api.sys.soshosai.com/groups/"
      );

      const cf_response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cf_payload),
      });

      if (!cf_response.ok) {
        const errorData = await cf_response.json();
        throw new Error(errorData.error || "サーバーエラーが発生しました");
      }

      const cf_data = await cf_response.json();
      showToast("送信成功", "データが送信されました。", "success");
      showToast("Status", "プリンタに印刷を行います。", "success");
      
      await print(cf_data);
      showToast("成功", "プリンタでの印刷が完了しました。", "success");
      
      // フォームのリセット
      setAgeInput("");
      setNumberOfPeople("");
      setSelectedOption(null);
      setGender("");
      setLoading(false);
      setStep(1);

    } catch (error) {
      setLoading(false);
      showToast(
        "エラー",
        `データの送信に失敗しました: ${error.message}`,
        "error"
      );
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKeyInput(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [step, numberOfPeople, ageInput]);

  const connect = () => {
    setConnectionStatus("Connecting ...");

    if (!window.epson || !window.epson.ePOSDevice) {
      setConnectionStatus("ePOSDevice is not available");
      return;
    }
    4;

    if (!ipAddress) {
      setConnectionStatus("Type the printer IP address");
      return;
    }
    if (!printerPort) {
      setConnectionStatus("Type the printer port");
      return;
    }

    setConnectionStatus("Connecting ...");

    let ePosDev = new window.epson.ePOSDevice();
    ePosDevice.current = ePosDev;
    ePosDev.connect(ipAddress, printerPort, (data) => {
      if (data === "OK") {
        ePosDev.createDevice(
          "local_printer",
          ePosDev.DEVICE_TYPE_PRINTER,
          { crypto: true, buffer: false },
          (devobj, retcode) => {
            if (retcode === "OK") {
              printer.current = devobj;
              printer.current.timeout = 60000;
              setConnectionStatus(STATUS_CONNECTED);
              printer.current.onreceive = function (res) {
                if (res.success) {
                  console.log("Print success");
                } else {
                  console.error("Print failure", res);
                }
              };
              printer.current.onerror = function (err) {
                console.error("Printer error", err);
              };
            } else {
              throw retcode;
            }
          }
        );
      } else {
        throw data;
      }
    });
  };

  const print = async (response) => {
    let groupId = response.group.GroupId;
    let prn = printer.current;
    if (!prn) {
      await connect();
    }
    showToast("Status", "印刷を始めています...", "success");
    setConnectionStatus("印刷を始めています...");
    const currentTime = new Date().toISOString();
    prn.addTextAlign(prn.ALIGN_CENTER);
    prn.addTextFont(prn.FONT_C);
    prn.addTextLang("ja");
    prn.brightness = 1.0;
    prn.halftone = prn.HALFTONE_ERROR_DIFFUSION;
    prn.addImage(context, 0, 0, 400, 400, prn.COLOR_1, prn.MODE_MONO);
    prn.addTextSmooth(true);
    prn.addFeedLine(1);
    prn.addTextSize(2, 2);
    prn.addTextSize(4, 4);
    prn.addText("蒼翔祭\n");
    prn.addTextSmooth(false);
    prn.addFeedLine(1);
    prn.addTextSize(2, 2);
    prn.addText("入場チケット\n");
    prn.addTextSize(1, 1);
    prn.addFeedLine(1);
    prn.addText("以下のQRコードは、\n入場時・再入場時・大抽選会\nの");
    prn.addTextStyle(false, true, true, prn.COLOR_1);
    prn.addText("全てにおいて必要となります。\n");
    prn.addTextStyle(false, false, false, prn.COLOR_1);
    prn.addText("管理には十分ご注意ください。\n");
    prn.addFeedLine(4);
    prn.addSymbol(
      groupId,
      prn.SYMBOL_QRCODE_MODEL_2,
      prn.LEVEL_DEFAULT,
      10,
      0,
      0
    );
    prn.addFeedLine(4);
    prn.addTextAlign(prn.ALIGN_LEFT);
    prn.addText(`グループID:${groupId}\n`);
    prn.addFeedLine(2);
    prn.addText(`発行場所:${place}\n`);
    prn.addFeedLine(2);
    prn.addText(`発行時刻:${currentTime}\n`);
    prn.addFeedLine(2);
    prn.addText(
      `年齢: ${selectedOption.label}, 性別: ${gender_js}, 人数: ${numberOfPeople}\n`
    );
    prn.addFeedLine(2);
    prn.addCut(prn.CUT_FEED);
    response.guests.forEach((guest, index) => {
      prn.addTextAlign(prn.ALIGN_CENTER);
      prn.addTextFont(prn.FONT_C);
      prn.addTextLang("ja");
      prn.brightness = 1.0;
      prn.halftone = prn.HALFTONE_ERROR_DIFFUSION;
      prn.addTextSmooth(true);
      prn.addFeedLine(1);
      prn.addTextSize(2, 2);
      prn.addText("蒼翔祭入場者ID\n");
      prn.addFeedLine(2);
      prn.addSymbol(
        guest.GuestId,
        prn.SYMBOL_QRCODE_MODEL_2,
        prn.LEVEL_DEFAULT,
        10,
        0,
        0
      );
      prn.addTextSize(1, 1);
      prn.addText(`${guest.GuestId}\n`);
      prn.addFeedLine(3);
      prn.addCut(prn.CUT_FEED);
    });
    prn.send();
  };

  const handleIpModalClose = () => {
    Cookies.set("ipAddress", ipAddress);
    Cookies.set("printerPort", printerPort);
    setIsConnecting(true);
    connect();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {window.location.pathname !== "/" && (
        <Modal
          isOpen={isIpModalOpen}
          onClose={handleIpModalClose}
          title="プリンターのIPアドレスを入力してください"
          footer={
            <button
              className={`px-4 py-2 rounded-md text-white ${
                isConnecting ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={handleIpModalClose}
              disabled={isConnecting}
            >
              {isConnecting ? "接続しています..." : "接続"}
            </button>
          }
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="IPアドレス"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="ポート番号"
              value={printerPort}
              onChange={(e) => setPrinterPort(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </Modal>
      )}

      <ToastContainer toasts={toasts} />

      {isPlaceInclude ? (
        <div className="h-screen w-screen flex justify-center items-center flex-col p-4">
          {loading ? (
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          ) : (
            <>
              {step === 1 && (
                <div className="text-center bg-white p-6 rounded-md shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-700">
                    グループの人数を入力してください
                  </h2>
                  <p className="text-5xl mt-5 text-blue-600">
                    {numberOfPeople || "0"}
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="text-center bg-white p-6 rounded-md shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-700">
                    {currentMemberIndex === 0
                      ? "代表者"
                      : `${currentMemberIndex + 1}人目`}
                    の年齢区分を入力してください
                  </h2>
                  <p className="text-5xl mt-5 text-blue-600">
                    {ageInput || "0"}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-5">
                    {options.map((option, index) => (
                      <button
                        key={option.age}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        onClick={() => {
                          setSelectedOption(option);
                          setStep(3);
                        }}
                      >
                        {index + 1}.{option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center bg-white p-6 rounded-md shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-700">
                    {currentMemberIndex === 0
                      ? "代表者"
                      : `${currentMemberIndex + 1}人目`}
                    の性別を選択してください
                  </h2>
                  <p className="text-5xl mt-5 text-blue-600">{gender || "0"}</p>
                  <div className="grid grid-cols-3 gap-4 mt-5">
                    <button
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        handleKeyInput("1");
                        handleKeyInput("Enter");
                      }}
                    >
                      1. 男性
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        handleKeyInput("2");
                        handleKeyInput("Enter");
                      }}
                    >
                      2. 女性
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        handleKeyInput("3");
                        handleKeyInput("Enter");
                      }}
                    >
                      3. 回答しない
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="h-screen w-screen flex flex-col justify-center items-center">
          <p className="text-2xl text-gray-700">
            URLは受付場所によって変化します。正しいものを選択してください。
          </p>
          <a href="./west" className="text-blue-500 hover:text-blue-600">
            西側
          </a>
          <a href="./front" className="text-blue-500 hover:text-blue-600">
            正面
          </a>
        </div>
      )}
      <canvas width="400" height="400" id="canvas" className="hidden"></canvas>
    </div>
  );
};

export default App;
