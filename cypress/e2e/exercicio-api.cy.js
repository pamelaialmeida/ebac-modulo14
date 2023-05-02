/// <reference types="cypress" />
import contratoUsuario from '../contracts/usuarios.contract'
import { faker } from '@faker-js/faker'

describe('Testes da Funcionalidade Usuários', () => {
     var opcoesAdministrador = ['true', 'false']

    it('Deve validar contrato de usuários', () => {
         cy.request('usuarios').then(response => {
               return contratoUsuario.validateAsync(response.body)
         })
    });

    it('Deve listar usuários cadastrados', () => {
         cy.request({
               method: 'GET',
               url: 'usuarios',
               failOnStatusCode: false
         }).then((response) => {
               expect(response.status).to.be.equal(200)
               expect(response.body).to.have.property('quantidade')
               expect(response.body.usuarios).to.have.length(response.body.quantidade)
               response.body.usuarios.forEach(usuario => {
                    expect(usuario).to.have.property('nome').to.be.a('string')
                    expect(usuario).to.have.property('email')
                    expect(usuario).to.have.property('password')
                    expect(usuario).to.have.property('administrador')
                    expect(usuario).to.have.property('_id')
               })
         })
    });

    it('Deve cadastrar um usuário com sucesso', () => {
          let nomeUsuario = faker.name.fullName()
          let emailUsuario = faker.internet.email(nomeUsuario)
          let senhaUsuario = faker.internet.password()
          let administrador = opcoesAdministrador[(Math.random() * opcoesAdministrador.length) | 0] 

          const usuario = {
               "nome": nomeUsuario,
               "email": emailUsuario,
               "password": senhaUsuario,
               "administrador": administrador
          }

          cy.request({
               method: 'POST',
               url: 'usuarios',
			headers: { 'Content-Type' : 'application/json'},
               body: usuario,
			failOnStatusCode: false
          }).then(response => {
               expect(response.status).to.be.equal(201)
               expect(response.body._id).to.not.be.empty
               expect(response.body.message).to.be.equal('Cadastro realizado com sucesso')
          })
    });

    it('Deve validar um usuário com email inválido', () => {
          let nomeUsuario = faker.name.fullName()
          let emailInvalidoUsuario = 'invalidoemail@'
          let senhaUsuario = faker.internet.password()
          let administrador = opcoesAdministrador[(Math.random() * opcoesAdministrador.length) | 0] 

          const usuarioEmailInvalido = {
               "nome": nomeUsuario,
               "email": emailInvalidoUsuario,
               "password": senhaUsuario,
               "administrador": administrador
          }

          cy.request({
               method: 'POST',
               url: 'usuarios',
               headers: { 'Content-Type' : 'application/json'},
               body: usuarioEmailInvalido,
               failOnStatusCode: false
          }).then(response => {
               expect(response.status).to.be.equal(400)
               expect(response.body.email).to.be.equal('email deve ser um email válido')
          })
    });

    it('Deve editar um usuário previamente cadastrado', () => {
         let nomeUsuario = faker.name.fullName()
         let emailUsuario = faker.internet.email(nomeUsuario)
         let senhaUsuario = faker.internet.password()
         let administrador = opcoesAdministrador[(Math.random() * opcoesAdministrador.length) | 0]  
         
         let emailEditado = faker.internet.email()
         
         //Cadastrando
         cy.cadastrarUsuario(nomeUsuario, emailUsuario, senhaUsuario, administrador)
               .then(response => {
                    let idUsuarioCadastrado = response.body._id

                    //Alterando
                    cy.request({
                         method: 'PUT',
                        url: `usuarios/${idUsuarioCadastrado}`,
                         headers: { 'Content-Type' : 'application/json'},
                         body: {
                              "nome": "Nome editado",
                              "email": emailEditado,
                              "password": "senhaEditada",
                              "administrador": administrador
                         },
                        failOnStatusCode: false
                    }).then(response => {
                         expect(response.status).to.be.equal(200)
                         expect(response.body.message).to.be.equal('Registro alterado com sucesso')
                    }).then(response => {
                         //Validando alteração
                         cy.request({
                              method: 'GET',
                              url: `usuarios/${idUsuarioCadastrado}`
                         }).then(response => {
                              expect(response.body.nome).to.be.equal('Nome editado')
                              expect(response.body.email).to.be.equal(emailEditado)
                              expect(response.body.password).to.be.equal('senhaEditada')
                              expect(response.body.administrador).to.be.equal(administrador)
                              expect(response.body._id).to.be.equal(idUsuarioCadastrado)
                         })
                    })
               })
    });


    it('Deve deletar um usuário previamente cadastrado', () => {
          let nomeUsuario = faker.name.fullName()
          let emailUsuario = faker.internet.email(nomeUsuario)
          let senhaUsuario = faker.internet.password()
          let administrador = opcoesAdministrador[(Math.random() * opcoesAdministrador.length) | 0]  
          
          //Cadastrando
          cy.cadastrarUsuario(nomeUsuario, emailUsuario, senhaUsuario, administrador)
               .then(response => {
                    let idUsuarioCadastrado = response.body._id

                    //Deletando
                    cy.request({
                         method: 'DELETE',
                         url: `usuarios/${idUsuarioCadastrado}`,
                         headers: { 'Content-Type' : 'application/json'},
                         failOnStatusCode: false
                    }).then(response => {
                         expect(response.status).to.be.equal(200)
                         expect(response.body.message).to.be.equal('Registro excluído com sucesso')
                    }).then(response => {
                         //Validando deleção
                         cy.request({
                              method: 'GET',
                              url: `usuarios/${idUsuarioCadastrado}`,
                              failOnStatusCode: false
                         }).then(response => {
                              expect(response.status).to.be.equal(400)
                              expect(response.body.message).to.be.equal('Usuário não encontrado')
                         })
                    })
               })
    });

});
