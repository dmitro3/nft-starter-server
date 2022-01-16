import fetch from 'node-fetch';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import FormData from 'form-data';
import { Sequelize, Model, DataTypes } from 'sequelize';
import cors from 'cors';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import MarkdownIt from 'markdown-it';
import { Readable } from 'stream';

const mdParser = new MarkdownIt();

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

async function generateWebsite(data) {
  const root = generateRandomString(12);
  return new Promise((res) => {
    fs.mkdir(root, () => {
      const introductionHTML = mdParser.render(data.introduction);
      const index = new Promise((res) => {
        ejs.renderFile(
          'templates/index.html',
          { ...data, introductionHTML },
          {},
          (err, str) => {
            fs.writeFile(`${root}/index.html`, str, res);
          }
        );
      });
      const js = new Promise((res) => {
        ejs.renderFile(
          'templates/index.tsx.92521aab.js',
          {
            text: JSON.stringify({
              collectionName: data.collectionName,
              tokens: data.tokens.map((e) => ({ tokenImage: e.tokenImage })),
              banner: data.banner,
              introduction: data.introduction,
              saleStartAt: data.saleStartAt,
              saleEndAt: data.saleEndAt,
              address: data.address,
              quotaPerAddr: data.quotaPerAddr,
            }),
          },
          {},
          (err, str) => {
            fs.writeFile(`${root}/index.js`, str, res);
          }
        );
      });
      Promise.all([index, js]).then(() => {
        const body = new FormData();
        body.append(
          'file',
          fs.createReadStream(`${root}/index.html`),
          'index.html'
        );
        body.append(
          'file',
          fs.createReadStream(`templates/templates/styles.402de4f5.js`),
          'templates/styles.402de4f5.js'
        );
        body.append(
          'file',
          fs.createReadStream(`templates/templates/vendors~main.e5b7d28e.js`),
          'templates/vendors~main.e5b7d28e.js'
        );
        body.append(
          'file',
          fs.createReadStream(`templates/main.db6e4397.js`),
          'main.db6e4397.js'
        );
        body.append(
          'file',
          fs.createReadStream(`templates/styles.55ed2f74.css`),
          'styles.55ed2f74.css'
        );
        body.append(
          'file',
          fs.createReadStream(
            `templates/templates/vendors~__react_static_root__/src/pages/index.tsx.f90194c0.js`
          ),
          'templates/vendors~__react_static_root__/src/pages/index.tsx.f90194c0.js'
        );
        body.append(
          'file',
          fs.createReadStream(`${root}/index.js`),
          'templates/__react_static_root__/src/pages/index.tsx.92521aab.js'
        );
        uploadFileToIpfs(body).then(res);
      });
    });
  });
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
  Promise.all([
    StartDomainName(req.body.domainToken, JSON.stringify(req.body)),
    generateWebsite(req.body).then(console.log),
  ]).then(([_, token]) => {});
});

app.post('/uploadTokens', function (req, res) {
  const root = generateRandomString(12);
  const tokens = [];
  for (let i = 0; i < req.body.tokens.length; i++) {
    const token = req.body.tokens[i];
    for (let q = 0; q < token.tokenAmount; q++)
      tokens.push({
        image: token.tokenImage,
        name: token.tokenName,
        description: token.tokenDescription,
        external_url: token.tokenWebsite,
        attributes: token.tokenAttributes.map((attr) => ({
          trait_type: attr.type,
          value: attr.value,
        })),
        animation_url: token.tokenAnimationURL,
        youtube_url: token.tokenYoutubeURL,
      });
  }
  // shuffle

  for (let i = tokens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
  }

  fs.mkdir(root, () => {
    Promise.all(
      tokens.map(
        async (token, id) =>
          await new Promise((res, rej) => {
            fs.writeFile(`${root}/${id}`, JSON.stringify(token), res);
          })
      )
    ).then(() => {
      const body = new FormData();

      for (var i = 0; i < tokens.length; i++) {
        body.append('file', fs.createReadStream(`${root}/${i}`));
      }

      uploadFileToIpfs(body).then((value) => {
        res.send({
          ok: true,
          cid: value.value.cid,
        });
        fs.rmdir(root, { recursive: true }, () => {});
      });
    });
  });
});

app.get('/', async function (req, res) {
  const site = await Domain.findAll({
    where: {
      domainName: req.query.domainName,
    },
    raw: true,
  });
  const data = JSON.parse(site[0].otherData);
  const introductionHTML = mdParser.render(data.introduction);
  console.log(data.banner);
  ejs.renderFile(
    'templates/index.html',
    { ...data, introductionHTML },
    {},
    (err, str) => {
      res.send(str);
    }
  );
});

app.get('/index.tsx.92521aab.js', async function (req, res) {
  const site = await Domain.findAll({
    where: {
      domainName: 'cccaaaad',
    },
    raw: true,
  });
  const data = JSON.parse(site[0].otherData);
  console.log(data.banner);
  ejs.renderFile(
    'templates/index.tsx.92521aab.js',
    {
      text: JSON.stringify({
        collectionName: data.collectionName,
        tokens: data.tokens.map((e) => ({ tokenImage: e.tokenImage })),
        banner: data.banner,
        introduction: data.introduction,
        saleStartAt: data.saleStartAt,
        saleEndAt: data.saleEndAt,
        address: data.address,
        quotaPerAddr: data.quotaPerAddr,
      }),
    },
    {},
    (err, str) => res.send(str)
  );
});

app.use('/', express.static('templates'));

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
  })
    .then((res) => {
      return res.json();
    })
    .catch(console);
}
