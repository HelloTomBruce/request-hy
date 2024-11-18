const axios = require("axios");
const webhook =
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=bb225150-05e6-4704-9e83-4d4ff6474398";
const allowTimes = {
  0: [],
  1: ["19:00-20:00"],
  2: ["19:00-20:00"],
  3: ["19:00-20:00"],
  4: ["19:00-20:00"],
  5: ["18:00-19:00", "19:00-20:00"],
  6: [],
};
const weekLabel = {
  0: "星期天",
  1: "星期一",
  2: "星期二",
  3: "星期三",
  4: "星期四",
  5: "星期五",
  6: "星期六",
};

async function checkHy(reserveDate, week) {
  try {
    const res = await axios({
      method: "post",
      url: "https://www.changxiaoer.cn/consumer/price/front",
      data: {
        basicId: "303121928",
        merchantId: "10064",
        userId: "",
        reserveDate,
      },
      headers: {
        "Content-Type": "application/json",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "CXE-Security-Code": "60dbf37f25064e57a7bd0089035fb662",
        Referer:
          "https://servicewechat.com/wx8a9be8367cf8ce1c/95/page-frame.html",
      },
    });
    const infos = res.data.data;
    const { timeIntervalTOs, siteInfoTOs } = infos;
    const siteInfoObj = {};
    siteInfoTOs.forEach((item) => {
      siteInfoObj[item.siteId] = item.name;
    });
    const canBooking = [];
    timeIntervalTOs.forEach((item) => {
      const { timeInterval, records } = item;
      if (
        records.length <= 1 &&
        records[0].siteLockStatus === 0 &&
        allowTimes[week].includes(timeInterval)
      ) {
        canBooking.push({
          timeInterval,
          reserveDate,
          siteName: siteInfoObj[records[0].siteId],
        });
      }
    });
    if (canBooking.length > 0) {
      const list = canBooking.map((item) => {
        return `${item.siteName} ${item.timeInterval}`;
      });
      sendMsg({
        msgtype: "text",
        text: {
          content: `${reserveDate} ${
            weekLabel[week]
          }, 有场地可以预定了，请尽快预定: \n${list.join("\n")}`,
          mentioned_list: ["@all"],
        },
      });
    }
  } catch (err) {
    console.log(err);
  }
}

function sendMsg(data) {
  axios({
    method: "post",
    url: webhook,
    data,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function task() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = date.getDay();
  for (let i = 0; i < 7; i++) {
    const reserveDate = `${year}-${month}-${day + i}`;
    let currentWeek = week + i;
    if (currentWeek > 6) {
      currentWeek -= 7;
    }
    await checkHy(reserveDate, currentWeek);
  }
}
function main() {
  task();
  setInterval(() => {
    task();
  }, 1000 * 60 * 60);
}

main();
