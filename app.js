import fetch from 'node-fetch';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import FormData from 'form-data';
import { Sequelize, Model, DataTypes } from 'sequelize';
import cors from 'cors';
import bodyParser from 'body-parser';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 接收到檔案後輸出的儲存路徑（若不存在則需要建立）
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // 這邊可以設定檔名，如果nft圖片要1、2、3...，如此往下的流水號在這邊更改。
    // 將儲存檔名設定為 時間戳 + 檔案原始名，比如 151342376785-123.jpg
    cb(null, file.originalname);
  },
});

var app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(bodyParser.json({ limit: '200mb' }));
var upload = multer({ storage: storage });

class Domain extends Model {}
class CheckDomainName extends Model {}

Domain.init(
  {
    domainName: DataTypes.STRING,
    otherData: DataTypes.STRING,
  },
  { sequelize, modelName: 'domain' }
);

CheckDomainName.init(
  {
    domainName: DataTypes.STRING,
    randomStr: DataTypes.STRING,
    deadline: DataTypes.DATE,
  },
  { sequelize, modelName: 'checkDomainName' }
);

// 註冊doamin name
async function regDomainName(domainName, time) {
  if (['api', 'www', 'admin'].includes(domainName))
    return res.send({ ok: false });
  await sequelize.sync();

  var today = new Date();

  const record = await CheckDomainName.findAll({
    where: {
      domainName: domainName,
    },
  });

  if (
    record.length &&
    record[record.length - 1].deadline.getTime() >= new Date().getTime()
  ) {
    return '';
  }

  var today = new Date();
  var deadline = new Date(today.getTime() + time);
  var randomStr = generateRandomString(30);

  // 新增資料庫資料
  await CheckDomainName.create({
    domainName: domainName,
    randomStr: randomStr,
    deadline: deadline,
  });
  return randomStr;
}

// 啟用domain name
async function StartDomainName(token, data) {
  await sequelize.sync();

  const checkDomainName = await CheckDomainName.findAll({
    where: {
      randomStr: token,
    },
  });
  if (!checkDomainName || checkDomainName.length === 0) {
    return false;
  }

  const checkDomainData = await Domain.findAll({
    where: {
      domainName: checkDomainName[0].domainName,
    },
  });
  if (checkDomainData && checkDomainData.length !== 0) {
    return false;
  }
  await Domain.create({
    domainName: checkDomainName[0].domainName,
    otherData: data,
  });
  checkDomainName[0].deadline = new Date(7953669383716);
  checkDomainName[0].save();
  return true;
}

// 產生隨機字串
const generateRandomString = (num) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const ipfs_nft_key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAxQ0U1N2Q0MTkwQjAwMGUyMTkyQjVkYTcwQjBDMTgwREIxQTA3MmYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MjMxOTk1MDI0NywibmFtZSI6Ik5GVCBIYWNrMjAyMiJ9.E6DGAgbviMBV9WFuf3wgB6XRdLklitx81fT2IZTf3dQ';

app.use('/public', express.static('public'));

// 上傳圖片的api
app.post('/upload', upload.array('upload'), function (req, res) {
  const body = new FormData();

  //組合data的body
  for (var i = 0; i < req.files.length; i++) {
    body.append('file', fs.createReadStream(req.files[i].path));
  }
  uploadFileToIpfs(body)
    .then(function (value) {
      console.log(value);
      res.send({
        ok: true,
        cid: value.value.cid,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        ok: false,
      });
    });
});

app.post('/upload_single', upload.array('upload', 1), function (req, res) {
  if (req.files.length !== 1) res.send({ ok: false });
  uploadFileToIpfs(fs.createReadStream(req.files[0].path))
    .then(function (value) {
      console.log(value);
      res.send({
        ok: true,
        cid: value.value.cid,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        ok: false,
      });
    });
});

app.post('/reg', function (req, res) {
  console.log(req.body);
  regDomainName(req.body.name, 60 * 10 * 1000).then(function (value) {
    if (value)
      res.send({
        ok: true,
        token: value,
      });
    else
      res.send({
        ok: false,
      });
  });
});

app.post('/create', function (req, res) {
  StartDomainName(req.body.domainToken, JSON.stringify(req.body)).then(
    function (value) {
      res.send({ ok: value });
    }
  );
});

var server = app.listen(process.env.PORT, '0.0.0.0', function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

// 上傳到ipfs
async function uploadFileToIpfs(body) {
  return fetch('https://api.nft.storage/upload', {
    body,
    headers: {
      Authorization: `Bearer ${ipfs_nft_key}`,
    },
    method: 'POST',
  }).then((res) => {
    return res.json();
  });
}
