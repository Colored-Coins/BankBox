var MetaEditor = React.createClass({
  findMaxLevel: function (element, level) {
    var myself = this
    if (!level) level = 0
    if (!Array.isArray(element)) return level
    var thisMax = 0
    element.forEach(function (node) {
      var tmp = myself.findMaxLevel(node.value, level + 1)
      if (tmp > thisMax) thisMax = tmp
    })
    return thisMax
  },
  findObjectAndParent: function (element, path) {
    if (path.length === 1) return {index: path[0], parent: element}
    var loc = path[0]
    var pathtmp = path.slice()
    pathtmp.shift()
    return this.findObjectAndParent(element[loc]['value'], pathtmp)
  },
  deleteObject: function (element, path) {
    var answer = this.findObjectAndParent(element, path)
    answer.parent.splice(answer.index, 1)
    return true
  },

  updateObject: function (element, path, newObject) {
    var answer = this.findObjectAndParent(element, path)
    answer.parent[answer.index] = newObject
    return true
  },

  getObject: function (element, path) {
    var answer = this.findObjectAndParent(element, path)
    return answer.parent[answer.index]
  },

  newObject: function (element, path, newObject) {
    var answer = this.findObjectAndParent(element, path)
    var i = answer.index
    var p = answer.parent
    if (!Array.isArray(p[i].value)) p[i].value = [newObject]
    else p[i].value.push(newObject)
    return true
  },
  addMetaField: function (event) {
    var index = $(event.target).attr('data-index').substr(1).split(",");
    var fields = this.props.data;

    if (index[0] === "")
      fields.push({key: "", value: "", type: "String", required: false});
    else
      this.newObject(fields,index,{key: "", value: "", type: "String", required: false});

    this.props.updateFunc(fields);
  },
  removeMetaField: function (event) {
    // get the index of the field
    var index = $(event.target).attr('data-index').substr(1).split(",");
    var fields = this.props.data;

    this.deleteObject(fields,index);
    this.props.updateFunc(fields);
  },
  duplicateField: function (event) {
    console.log("bleh")
    var index = $(event.target).attr('data-index').substr(1).split(",");
    var fields = this.props.data;

    // get the current object
    var obj = this.findObjectAndParent(fields,index);
    var added = $.extend(true, {}, this.getObject(fields,index));

    // add object ot its parent
    obj.parent.push(added);

    this.props.updateFunc(fields);
  },
  updateMetaField: function (event) {
    // get the index of the field
    var index = $(event.target).attr('data-index').substr(1).split(",");
    var fields = this.props.data;
    var value = event.target.value;

    if ($(event.target).attr('type') == 'checkbox') {
      value =  $(event.target).prop('checked') ? true : false;
    }

    // get the field
    var obj = this.getObject(fields,index);

    // check what part to update
    if (event.target.id == "fieldName")
      obj.key = value;

    if (event.target.id == "fieldValue")
      obj.value = value;

    if (event.target.id == "fieldRequired")
      obj.required = value;

    if (event.target.id == "fieldType") {
      obj.type = value;
      obj.value = "";
      if (value == "Array") obj.value = [{key: "", value: "", type: "String", required: false}]
    }

    // change the value
    this.updateObject(fields,index,obj);
    this.props.updateFunc(fields);
  },
  render: function () {
    var max = this.findMaxLevel(this.props.data);
    return (
      <MetaGroup maxLevel={max} keyPair={this.props.keyPair} view={this.props.view} level={0} data={this.props.data} showReq={this.props.showReq} groupData="" first="1" index={""} addMetaField={this.addMetaField} updateMetaField={this.updateMetaField} duplicateField={this.duplicateField} removeMetaField={this.removeMetaField} />
    );
  }
});

var MetaField = React.createClass({
  render: function () {

    var fieldType;
    switch (this.props.data.type) {
      case "String":
        fieldType = "text";
        break;
      case "Number":
        fieldType = "number";
        break;
      case "Boolean":
        fieldType = "checkbox";
        break;
      case "Date":
        fieldType = "date";
        break;
      case "URL":
        fieldType = "url";
        break;
      case "Email":
        fieldType = "email";
        break;
    }
    var actionDisplay = "block";
    var disabled = false;
    if (this.props.view) {
      disabled = true;
      actionDisplay = "none";
    }

    var widthStep = 25;
    var minTypeWidth = 150;
    var actionsWidth = 200;
    var padding = 5;

    var width = ((this.props.maxLevel - this.props.level) * widthStep) + minTypeWidth;
    var widthCol = padding * 2 + minTypeWidth + (this.props.maxLevel - 1) * widthStep;
    var KeyPairWidth = widthCol + 100;
    var keyPairPad = this.props.level * widthStep;
    var fieldsOffset = widthCol + actionsWidth;
    if (this.props.view)
      fieldsOffset = fieldsOffset - actionsWidth;
    var fieldsWidth = "calc(100% - "+ fieldsOffset +"px)";
    var requiredVal = (this.props.data.required === false || this.props.data.required === "false") ? false : true;
    var required = <div className="actionRequired"><input type="checkbox" disabled={disabled} className="form-control" id="fieldRequired" data-index={this.props.index} onChange={this.props.updateMetaField} checked={requiredVal} /></div>;

    var checked = (this.props.data.value === false || this.props.data.value === "false") ? false : true;
    var fieldValue = <div style={{width: "67%", padding: "0 5px"}} className="pull-left"><input type={fieldType} disabled={disabled} placeholder="Field Value" data-index={this.props.index} id="fieldValue" value={this.props.data.value} checked={checked} className="form-control" onChange={this.props.updateMetaField} /></div>;
    var addField = "";

    if (!this.props.showReq)
      required = "";

    if (this.props.data.type == "Array") {
      fieldValue = "";
      required = "";
      width = width + widthStep;
      addField = <div className="actionAdd" data-index={this.props.index} onClick={this.props.addMetaField} title="Add Field"></div>;
    }

    if (this.props.keyPair) {
      if (this.props.data.type == "Array") {
        keyPairPad = keyPairPad - widthStep;
        return (
          <div style={{padding: "0 5px", paddingLeft: keyPairPad+"px", height: "40px", lineHeight: "40px", fontWeight: "bold", textTransform: "capitalize"}}>{this.props.data.key}</div>
        )
      } else {
        return (
          <div className="form-group has-feedback templateMetaField">
            <label htmlFor="fieldValue" className="col-sm-4 control-label" style={{lineHeight: "30px", textAlign: "left", width: KeyPairWidth+"px", padding: "0 5px", paddingLeft: keyPairPad+"px"}}>{this.props.data.key}</label>
            <div className="col-sm-8">
              <input type={fieldType} disabled={disabled} placeholder="Field Value" data-index={this.props.index} id="fieldValue" value={this.props.data.value} checked={this.props.data.value} className="form-control" onChange={this.props.updateMetaField} required={requiredVal} />
              <span className="glyphicon form-control-feedback" aria-hidden="true"></span>
            </div>
          </div>
        )
      }
    } else {
      return (
        <div className="templateMetaField" data-index={this.props.index}>
          <div style={{width: widthCol+"px", padding: "0 "+padding+"px"}} className="pull-left">
            <select style={{width: width+"px"}} disabled={disabled} id="fieldType" data-index={this.props.index} defaultValue={this.props.data.type} className="form-control pull-right" onChange={this.props.updateMetaField} >
              <option value="String">String</option>
              <option value="Number">Number</option>
              <option value="Boolean">Boolean</option>
              <option value="Date">Date</option>
              <option value="URL">URL</option>
              <option value="Email">Email</option>
              <option value="Array">Array</option>
            </select>
          </div>
          <div className="pull-left" style={{width: fieldsWidth}}>
            <div className="pull-left" style={{width: "33%", padding: "0 5px"}}><input type="text" disabled={disabled} id="fieldName" placeholder="Field Name" data-index={this.props.index} value={this.props.data.key} className="form-control" onChange={this.props.updateMetaField} /></div>
            {fieldValue}
          </div>
          <div style={{width: actionsWidth, padding: "0 5px", display: actionDisplay}} className="pull-right">
            {required}
            <div className="actionRemove" title="Remove Field" data-index={this.props.index} id={"rem"+this.props.index} onClick={this.props.removeMetaField}></div>
            <div className="actionDup" title="Duplicate Field" data-index={this.props.index} id={"dup"+this.props.index} onClick={this.props.duplicateField}></div>
            {addField}
          </div>
        </div>
      )
    }
  }
})

var MetaGroup = React.createClass({
  render: function () {
    var myself = this;
    var fields = this.props.data.map(function (field, i) {
      if (field.type == "Array")
        return <MetaGroup showReq={myself.props.showReq} keyPair={myself.props.keyPair} view={myself.props.view} maxLevel={myself.props.maxLevel} level={myself.props.level + 1} duplicateField={myself.props.duplicateField} data={field.value} parentField={field} groupData={field} index={myself.props.index + "," + i} key={myself.props.index + "," + i} updateMetaField={myself.props.updateMetaField} removeMetaField={myself.props.removeMetaField} addMetaField={myself.props.addMetaField} />;
      return <MetaField showReq={myself.props.showReq} keyPair={myself.props.keyPair} view={myself.props.view} addMetaField={myself.props.addMetaField} maxLevel={myself.props.maxLevel} level={myself.props.level + 1} duplicateField={myself.props.duplicateField} data={field} index={myself.props.index + "," + i} key={myself.props.index + "," + i} updateMetaField={myself.props.updateMetaField} removeMetaField={myself.props.removeMetaField} />
    });

    var addButton = <a className="addButton btn" data-index={this.props.index} onClick={this.props.addMetaField}>Add New +</a>;
    if (this.props.view)
      addButton = "";

    // get parent field
    if (!this.props.first) {
      return (
        <div className="metaGroup" data-index={this.props.index}>
          <MetaField addMetaField={this.props.addMetaField} keyPair={this.props.keyPair} view={this.props.view} maxLevel={myself.props.maxLevel} level={myself.props.level + 1} duplicateField={myself.props.duplicateField} data={this.props.parentField} index={myself.props.index} key={myself.props.index} updateMetaField={myself.props.updateMetaField} removeMetaField={myself.props.removeMetaField} />
          <div>
            {fields}
          </div>
        </div>
      )
    } else {
      if (this.props.keyPair)
        addButton = "";
      return (
        <div style={{padding: "10px 0"}} data-index={this.props.index}>
          <div>
            {fields}
            {addButton}
          </div>
        </div>
      )
    }
  }
})