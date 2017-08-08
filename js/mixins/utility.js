import ReactDOM from 'react-dom';

/**
 * 실패한 제약조건 { error: [] }을 반환하거나 유효한 제약 조건이 적용 가능한 제약조건
 * 이름과 값 형태로 된 맵인 경우 참을 반환
 * 유효성 검사는 값이 유효할 경우 참을 반환하고 그렇지 않을 경우 거짓을 반환
*/
export function validate(val, constraints){
  var errors=[];
  var validators={
    minlength: {
      fn: function(val, cVal){
        return typeof val === 'string' && val.length >= cVal;
      },
      msg: function(val, cVal){
        return 'minimum ' + cVal + ' characters';
      }
    },
    required: {
      fn: function(val){
        return typeof val === 'string'? !/^\s*$/.test(val): val!==undefined && val!==null;
      },
      msg: function(){
        return 'required field';
      }
    },
    exclusive: {
      fn: function(val, list){
        if(!(list instanceof Array)){
          return false;
        }
        return list.filter(function(v){
          return v === val;
        }) < 1;
      },
      msg: function(val){
        return val + ' is already taken';
      }
    }
  };

  if(!constraints || typeof constraints !== 'object'){
    return true;
  }

  //각 제약조건 검사
  for(let constraint in constraints){
    let validator, currentConstraint;

    if(constraints.hasOwnProperty(constraint) && validators.hasOwnProperty(constraint.toLowerCase())){
      validator = validators[constraint.toLowerCase()];
      currentConstraint = constraints[constraint];

      if(!validator.fn(val, currentConstraint)){
        errors.push({
          constraint: constraint,
          msg: validator.msg(val, currentConstraint)
        });
      }
    }
  }

  return errors.length > 0 ?
    {errors: errors}:
    true;
};


//믹스인
export var formMixins = {
  getInputEle: function(ref){
    if(!this.isMounted()){
      return;
    }
    return this.refs[ref]?
      ReactDOM.findDOMNode(this.refs[ref]).querySelector('input'):
      ReactDOM.findDOMNode(this).querySelector('[name=' + ref + '] input');
  },
  validateField: function(fieldName, constraintOverride){
    let fieldVal = this.getInputEle(fieldName).value, currentConstraint, errors;

    if(fieldName in this.constraints){
      currentConstraint = constraintOverride || this.constraints[fieldName];
      errors = validate(fieldVal, currentConstraint);
      return !!errors.errors? errors.errors: false;
    } else{
      return true;
    }
  }
};
