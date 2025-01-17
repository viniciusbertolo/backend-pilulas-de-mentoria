const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");
const saltRounds = 10;

{
  /*Conexão Com o banco de dados */
}

// const db = mysql.createPool({
//   host: "us-cdbr-east-06.cleardb.net",
//   user: "bca979a5fdd0a6",
//   password: "dee87e51",
//   database: "heroku_796c03910f34e5f",
// });

const db = mysql.createPool({
  host: "pilulasbd.mysql.dbaas.com.br",
  user: "pilulasbd",
  password: "Vamb1808@",
  database: "pilulasbd",
});

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "vamb1808",
//   database: "pilulasmentoria",
// });

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Bem vindos ao backend do pilulas de mentoria");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const empresa = req.body.empresa;
  const profissao = req.body.profissao;
  const nome = req.body.nome;
  const phone = req.body.phone;
  const cep = req.body.cep;
  const logradouro = req.body.logradouro;
  const numero = req.body.numero;
  const bairro = req.body.bairro;
  const cidade = req.body.cidade;
  const estado = req.body.estado;
  const data_nascimento = req.body.data_nascimento;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length == 0) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        db.query(
          "INSERT INTO usuarios (email, password, profissao, nome, phone, cep, logradouro, numero, bairro, cidade, estado, data_nascimento,empresa) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            email,
            hash,
            profissao,
            nome,
            phone,
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            data_nascimento,
            empresa
          ],
          (err, response) => {
            if (err) {
              res.send(err);
            }

            res.send({ msg: "Usuário cadastrado com sucesso" });
          }
        );
      });
    } else {
      res.send({ msg: "Email já cadastrado!" });
    }
  });
});




app.put("/update-senha/:email/:password", (req, res) => {
  const email = req.params.email;
  const password = req.params.password;


  db.query(
    "UPDATE usuarios SET password = ? WHERE email = ?",
    [password, email],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});




{
  /*Verificação de login*/
}

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response) => {
        if (error) {
          res.send(error);
        }
        if (response === true) {
          res.send(response);
          console.log(response);
        } else {
          res.send({ msg: "Email ou senha incorreta!" });
        }
      });
    } else {
      res.send({ msg: "Usuário não registrado!" });
    }
  });
});

app.get("/cursos", (req, res) => {
  let sql = "SELECT *  FROM curso";
  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/fases/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT *  FROM fases where ID_CURSO_ATUAL = ?",
    [id],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/detalhes-usuario/:email", (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT *  FROM usuarios where email = ?",
    [email],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/usuario-curso/:email", (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT *  FROM usuario_curso where email_usuario = ?",
    [email],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/videos/:id/:nroPilula", (req, res) => {
  const id = req.params.id;
  const nroPilula = req.params.nroPilula;
  db.query(
    "SELECT * FROM fases where ID_CURSO_ATUAL = ? and NRO = ?",
    [id, nroPilula],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});
app.get("/perguntas/:id/:nroPilula", (req, res) => {
  const id = req.params.id;
  const nroPilula = req.params.nroPilula;
  db.query(
    "SELECT * FROM alternativas where ID_cursoAtual = ? and NRO_FASE = ?",
    [id, nroPilula],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/questao/:id/:nroPilula", (req, res) => {
  const id = req.params.id;
  const nroPilula = req.params.nroPilula;
  db.query(
    "SELECT * FROM fases where ID_CURSO_ATUAL = ? and NRO = ?",
    [id, nroPilula],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/usuarios", (req, res) => {
  db.query(
    "SELECT * FROM usuarios",
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});
app.get("/caminho-concluido/:email/:idCurso", (req, res) => {
  const email = req.params.email;
  const idCurso = req.params.idCurso;
  db.query(
    "SELECT * FROM conclui_etapa where emailUsuario = ? and ID_usuario = ?",
    [email, idCurso],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/caminho-concluido/:idCurso", (req, res) => {
  const idCurso = req.params.idCurso;
  db.query(
    "SELECT * FROM conclui_etapa where ID_usuario = ?",
    [idCurso],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.post("/inserir-primeiro-caminho/:email/:idCurso/:nroFase", (req, res) => {
  const email = req.params.email;
  const idCurso = req.params.idCurso;
  const nroFase = req.params.nroFase;

  db.query(
    "SELECT * FROM conclui_etapa WHERE emailUsuario = ? and ID_usuario = ? and NRO_FASE_ATUAL =?",
    [email, idCurso, nroFase],
    (err, result) => {
      if (err) {
        res.send(err);
      }
      if (result.length == 0) {
        db.query(
          "INSERT INTO conclui_etapa (emailUsuario, ID_usuario, NRO_FASE_ATUAL) values (?,?,?)",
          [email, idCurso, nroFase],
          (err, result) => {
            if (err) console.log(err);
            else res.send(result);
          }
        );
      } else {
        res.send({ msg: "Já cadastrada fase 1 ou superior" });
      }
    }
  );
});

app.put("/pergunta-acertada/:email/:idCurso/:nroFase/:nroFaseAnterior", (req, res) => {
  const email = req.params.email;
  const idCurso = req.params.idCurso;
  const nroFase = req.params.nroFase;
  const nroFaseAnterior = req.params.nroFaseAnterior;
  db.query(
    "UPDATE conclui_etapa SET NRO_FASE_ATUAL = ?,emailUsuario = ?, ID_usuario = ? WHERE emailUsuario = ? and ID_usuario = ? and NRO_FASE_ATUAL = ?",
    [nroFase, email, idCurso, email, idCurso, nroFaseAnterior],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.post("/upload-curso", (req, res) => {
  const nome = req.body.nome;
  const descricao = req.body.descricao;
  const urlVideoPreview = req.body.urlVideoPreview;


  db.query(
    "INSERT INTO curso (nome, descricao, URL_VIDEO_PREVIW) values (?,?,?)",
    [nome, descricao, urlVideoPreview],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});


app.post("/upload-fase", (req, res) => {
  const numero = req.body.numero;
  const idCurso = req.body.idCurso;
  const nome = req.body.nome;
  const descricao = req.body.descricao;
  const url = req.body.url;
  const pergunta = req.body.pergunta;
  const material = req.body.material;


  db.query(
    "INSERT INTO fases (NRO, ID_CURSO_ATUAL, nome, descricao, URL_VIDEO, pergunta, materialExtra) values (?,?,?,?,?,?,?)",
    [numero, idCurso, nome, descricao, url, pergunta, material],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});


app.post("/upload-respostas", (req, res) => {
  const numeroFase = req.body.numeroFase;
  const idCurso = req.body.idCurso;
  const alternativa1 = req.body.alternativa1;
  const alternativa2 = req.body.alternativa2;
  const alternativa3 = req.body.alternativa3;
  const alternativa4 = req.body.alternativa4;
  const correta = req.body.correta;

  db.query(
    "INSERT INTO alternativas (NRO_FASE, ID_cursoAtual, alternativa1, alternativa2, alternativa3, alternativa4, correta) values (?,?,?,?,?,?,?)",
    [numeroFase, idCurso, alternativa1, alternativa2, alternativa3, alternativa4, correta],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});




app.post("/liberar-curso", (req, res) => {
  const email = req.body.email;
  const curso = req.body.curso;
  const codigo = req.body.codigo;


  db.query(
    "INSERT INTO usuario_curso (email_usuario, ID_CURSO, codigo) values (?,?,?)",
    [email, curso, codigo],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});




app.listen(process.env.PORT || 3001, () => {
  console.log("rodando na porta 3001");
});
