class UserController {
  constructor (formIdCreate, formIdUpdate, tableid) {
    this.formEl = document.getElementById(formIdCreate);
    this.formUpdateEl = document.getElementById(formIdUpdate);
    this.tableEl = document.getElementById(tableid);
    this.initialize();
  }

  initialize() {
    this.onSubmit();
    this.onEditCancel();
    this.selecAll();
  }

  onEditCancel() {
    document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e => {
      this.showPanelCreate();
    });

    this.formUpdateEl.addEventListener('submit', e => {
      e.preventDefault();
      let btnSend = this.formUpdateEl.querySelector('[type=submit]');
      btnSend.disabled = true;
      let values = this.getValues(this.formUpdateEl);

      let index = this.formUpdateEl.dataset.trIndex;

      let tr = this.tableEl.rows[index];

      let userOld = JSON.parse(tr.dataset.user);

      let result = Object.assign({}, userOld, values);

      this.getPhoto(this.formUpdateEl).then(
        (content) => {

          if (!values.photo) {
            result._photo = userOld._photo;
          } else {
            result._photo = content;
          }

          let user = new User();

          user.loadFromJSON(result);

          user.save();

          this.getTr(user, tr);

          this.addEventsTr(tr);

          this.updateCount();

          this.formUpdateEl.reset();

          this.showPanelCreate();

          btnSend.disabled = false;
        },
        (e) => {
          console.error(e);
        }
      );

    });
  }





  onSubmit() {
    this.formEl.addEventListener('submit', event => {
      event.preventDefault();
      let btnSend = this.formEl.querySelector('[type=submit]');
      btnSend.disabled = true;

      let values = this.getValues(this.formEl);

      if (!values) return false;

      this.getPhoto(this.formEl).then(
        (content) => {
          values.photo = content;
          values.save();
          this.inserirLinha(values);
          this.formEl.reset();
          btnSend.disabled = false;
        },
        (e) => {
          console.error(e);
        }
      );
    });
  }

  getPhoto(formEl) {

    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      let elements = [...formEl.elements].filter(item => {
        if (item.name === 'photo') {
          return item;
        }
      });

      let file = elements[0].files[0];

      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = () => {
        reject(e);
      };
      if (file) {
        fileReader.readAsDataURL(file);
      } else {
        resolve('dist/img/boxed-bg.jpg');
      }
    });


  }

  getValues(formEl) {
    let user = {};
    let isValid = true;

    [...formEl.elements].forEach(function (field, index) {

      //Validar campos obrigatorios
      if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
        field.parentElement.classList.add('has-error');
        isValid = false;
      }



      if (field.name == 'gender') {
        if (field.checked) {
          user[field.name] = field.value;
        }
      } else if (field.name == "admin") {
        user[field.name] = field.checked;
      } else {
        user[field.name] = field.value;
      }
    });

    //Validar formulario 
    if (isValid) {
      return new User(
        user.name,
        user.gender,
        user.birth,
        user.country,
        user.email,
        user.password,
        user.photo,
        user.admin
      );
    }
  }
  //fechando a classe getvalue

  inserirLinha(dataUser) {

    let tr = this.getTr(dataUser);

    this.tableEl.appendChild(tr);

    this.updateCount();

  }

  getTr(dataUser, tr = null) {
    if (tr === null) tr = document.createElement('tr');

    tr.dataset.user = JSON.stringify(dataUser);

    tr.innerHTML = `
                      <tr>
                        <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                        <td>${dataUser.name}</td>
                        <td>${dataUser.email}</td>
                        <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                        <td>${Util.dateFormat(dataUser.register)}</td>
                        <td>
                          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                          <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
                        </td>
                      </tr>`;


    this.addEventsTr(tr);

    return tr;
  }

  showPanelCreate() {
    document.querySelector('#box-user-update').style.display = 'none';
    document.querySelector('#box-user-create').style.display = 'block';
  }
  showPanelUpdate() {
    document.querySelector('#box-user-update').style.display = 'block';
    document.querySelector('#box-user-create').style.display = 'none';
  }


  updateCount() {
    let numberUsers = 0;
    let numberUsersAdmin = 0;

    [...this.tableEl.children].forEach(tr => {
      numberUsers++;

      let user = JSON.parse(tr.dataset.user);
      if (user._admin) numberUsersAdmin++;
    });

    document.querySelector('#users-number').innerHTML = numberUsers;
    document.querySelector('#users-number-admin').innerHTML = numberUsersAdmin;
  }

  addEventsTr(tr) {


    tr.querySelector(".btn-delete").addEventListener("click", e => {

      if (confirm("Deseja realmente excluir?")) {
        tr.remove();
        this.updateCount();
      }

    });



    tr.querySelector('.btn-edit').addEventListener('click', e => {

      let json = JSON.parse(tr.dataset.user);


      this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

      for (let name in json) {
        let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

        if (field) {
          switch (field.type) {
            case 'file':
              break;
            case 'radio':
              field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
              field.checked = true;
              break;
            case 'checkbox':
              field.checked = json[name];
              break;
            default:
              field.value = json[name];

          }
        }
      }

      this.formUpdateEl.querySelector(".photo").src = json._photo;

      this.showPanelUpdate();

    });
  }


  selecAll() {

    let users = User.getUsersStorage();

    users.forEach(dataUser => {
      let user = new User();

      user.loadFromJSON(dataUser);

      this.inserirLinha(user);

    });

  }

}