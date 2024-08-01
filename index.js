const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const expressFileupload = require('express-fileupload')
const cors = require('cors')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
// Set up Global configuration access
dotenv.config();
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'member'
    }
})
app.use(cors())
app.use(bodyParser.json())// ใช้ได้ทุก url
const port = 7000


app.post('/login',async (req,res) => {
    console.log(req.body)
    // 1. chech require
    if(req.body.email == '' || req.body.passwd == '' ){
        return res.send ({
            massege:"กรุณาตรวจสอบ User และ Password",
            status: 'error_empty'
        })
    }
    console.log('Next step 2')
    // 2. check value in database
    let ids = await knex("users")
    .where({
        email: req.body.email,
        password: req.body.passwd
    })
    console.log(ids.length)
    if(ids.length == 0) {
        return res.send({
            massege:"กรุณาตรวจสอบ Users และ Password ให้ถูกต้อง",
            status:'error_user'
        })
    }
    console.log('Next step 3 success')
    res.send({
        massege: "Login Success",
        status: 'ok',
        row: ids[0]
    })
});

app.get('/listid',async (req, res) => {
    console.log('email=',  req.query)
    let ids = await knex("users")
       .where({email: req.query.email})
    res.send({
        row: ids[0],
        status: 'ok'
    })
})

app.get('/', (req, res) => {
    console.log(req, res)
    res.send({
      status: 'chaiyaphum',
      data : req.query
    })
})
app.post('/update', async (req, res) => {
    console.log(req.body.id)
    // console.log(req.body.username)
    // console.log(req.body.password)
    // console.log(req.body.email)
    let id = req.body.id
    let username = req.body.username
    let passwd = req.body.password
    let email = req.body.email
    let status = req.body.status
    let picture = req.body.picture
    try {
        let ids = await knex('users').where({ id : id }).update({ username: username, password: passwd, email: email, status: status, picture: picture});
        res.send({
            ok: 'yes',
            id: ids
        })
    } catch (e) {
        res.send({
            ok: '0',
            error: e.message
        })
    }
})

app.post('/insert',async (req,res) =>{
    console.log(req.body)
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let picture = req.body.picture
    let status = req.body.status
  
        try {
          let ids = await knex('users').insert({
          username:username,
          password: password,
          email: email,
          picture: picture,
          status: status,
      });
          res.send({
          status : 'ok',
          id : ids[0],
        });
        } catch (e) {
        res.send({
          status: 0 ,
          error : e.message
      
        })
        }
      });
 //ลบ
app.get('/delete', async (req, res) => {
    try {
        console.log(req.query)
        let id = req.query.id
        await knex('users').where('id',id).del();
        
        res.send({
        ok: 'yes',
        })
        } catch (e) {
            res.send({
            ok : 0,
            error : e.message
            })
        }
    
})

app.post('/search', async (req, res) => {
  console.log(req.body)
  let id = req.body.id
  try {
      let row = await knex('users').where({ id: id }).select()
      res.send({
          ok: 'yes',
          rows: row
      })
  } catch (error) {
      res.send({
          ok: '0',
          error: error.message
      })
  }
})
     

app.get('/list', async function (req, res) {
    try {
        let row = await knex('users')
    res.send({
        ok : 'yes' ,
        rows : row
    })
    } catch (e) {
      res.send({
        ok : 0 ,
        error: e.message
      })
    }
})
app.get('/register', (req, res) => {
    res.send('ลงทะเบียน!')
})
///
// Main Code Here //
// Generating JWT
app.post("/user/generateToken", (req, res) => {
    // Validate User Here
    // Then generate JWT Token

    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        time: Date(),
        userId: 12,
    }

    const token = jwt.sign(data, jwtSecretKey);
    console.log("token=",token)

    res.send(token);
});

// Verification of JWT
app.get("/user/validateToken", (req, res) => {
    // Tokens are generally passed in header of request
    // Due to security reasons.

    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const token = req.header(tokenHeaderKey);

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return res.send("Successfully Verified");
        } else {
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
});
///
app.listen(port, function() {
  console.log(`Example app listening on port ${port}`)
})