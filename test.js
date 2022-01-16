var today = new Date()
console.log(today)
today = new Date(today.getTime() + 1000000000)
console.log(new Date(100000000000000))


// function a (){
//   var students = new Array();
//   students[0] = "pika";
//   students[1] = "hello";
//   students[2] = "hey";
//   var json = JSON.stringify(students);

//   return students;
// }

// console.log((a()))



// var aaaa = [
//   checkDomainName {
//     dataValues: {
//       id: 1,
//       domainName: 'ddd',
//       randomStr: 'u529GRuXAO',
//       deadline: 2022-01-16T07:21:39.926Z,
//       createdAt: 2022-01-16T04:34:59.928Z,
//       updatedAt: 2022-01-16T04:34:59.928Z
//     },
//     _previousDataValues: {
//       id: 1,
//       domainName: 'ddd',
//       randomStr: 'u529GRuXAO',
//       deadline: 2022-01-16T07:21:39.926Z,
//       createdAt: 2022-01-16T04:34:59.928Z,
//       updatedAt: 2022-01-16T04:34:59.928Z
//     },
//     uniqno: 1,
//     _changed: Set(0) {},
//     _options: {
//       isNewRecord: false,
//       _schema: null,
//       _schemaDelimiter: '',
//       raw: true,
//       attributes: [Array]
//     },
//     isNewRecord: false
//   },
//   checkDomainName {
//     dataValues: {
//       id: 2,
//       domainName: 'c',
//       randomStr: 'yewgxcNbXL',
//       deadline: 2022-01-16T07:21:43.781Z,
//       createdAt: 2022-01-16T04:35:03.782Z,
//       updatedAt: 2022-01-16T04:35:03.782Z
//     },
//     _previousDataValues: {
//       id: 2,
//       domainName: 'c',
//       randomStr: 'yewgxcNbXL',
//       deadline: 2022-01-16T07:21:43.781Z,
//       createdAt: 2022-01-16T04:35:03.782Z,
//       updatedAt: 2022-01-16T04:35:03.782Z
//     },
//     uniqno: 1,
//     _changed: Set(0) {},
//     _options: {
//       isNewRecord: false,
//       _schema: null,
//       _schemaDelimiter: '',
//       raw: true,
//       attributes: [Array]
//     },
//     isNewRecord: false
//   }
// ]



// curl -X 'POST' \
//   'https://api.nft.storage/upload' \
//   -H 'accept: application/json' \
//   -H 'Content-Type: multipart/form-data' \
//   -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNhNTIwNTYxYzkxM0Y5ODkwY0U5YUQwNDQ3ODM2YmJEMDI3MzFmMkEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MjIyMTA2MjA0OCwibmFtZSI6ImhhY2thdGhvbiJ9.0oLGtZV_kiR0Ue2IF9xWySTXB68X39L6rR9Yc5se1So' \
//   -F 'file=@istockphoto-523037391-170667a.jpgtype=image/jpeg' \
//   -F 'file=@istockphoto-604373174-170667a.jpg;type=image/jpeg' \
//   -F 'file=@gettyimages-1126904404-612x612.jpg;type=image/jpeg' \
//   -F 'file=@吉祥物-波比.jpg;type=image/jpeg'