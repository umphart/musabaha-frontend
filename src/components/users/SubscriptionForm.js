import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubscriptionForm.css';

const SubscriptionForm = () => {
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [plots, setPlots] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Subscriber's Data
    title: '',
    name: '',
    residentialAddress: '',
    occupation: '',
    officeAddress: '',
    dob: '',
    stateOfOrigin: '',
    lga: '',
    sex: '',
    telephone: '',
    nationality: '',
    officeNumber: '',
    homeNumber: '',
    postalAddress: '',
    email: '',
    identification: '',
    utilityBill: '',
    passportPhoto: null,
    identificationFile: null,
    utilityBillFile: null,
    
    // Next of Kin's Data
    nextOfKinName: '',
    nextOfKinAddress: '',
    nextOfKinRelationship: '',
    nextOfKinTel: '',
    nextOfKinOccupation: '',
    nextOfKinOfficeAddress: '',
    nextOfKinEmail: '',
    
    // Plot Information
    estateName: '',
    numberOfPlots: '',
    proposedUse: '',
    proposedType: '',
    plotSize: '',
    paymentTerms: '',
    price: '',
    plotId: '',
    
    // Alternative Contact
    altContactName: '',
    altContactAddress: '',
    altContactRelationship: '',
    altContactTel: '',
    altContactEmail: '',
    
    // Referral Information
    referralAgentName: '',
    referralAgentContact: '',
    
    // Agreement
    agreedToTerms: false,
    signatureText: '',
    signatureFile: null
  });
   useEffect(() => {
    const fetchPlots = async () => {
      try {
        const res = await fetch("https://musabaha-home-ltd.onrender.com/api/plots");
        const data = await res.json();
        if (data.success) {
          // only keep Available plots
          setPlots(data.data.filter(plot => plot.status === "Available"));
        }
      } catch (err) {
        console.error("Error fetching plots:", err);
      }
    };

    fetchPlots();
  }, []);

  // Field length validation based on database constraints
  const fieldMaxLengths = {
    title: 10,
    name: 100,
    residentialAddress: 200,
    occupation: 50,
    officeAddress: 200,
    stateOfOrigin: 50,
    lga: 50,
    sex: 10,
    telephone: 20,
    nationality: 50,
    officeNumber: 20,
    homeNumber: 20,
    postalAddress: 200,
    email: 100,
    identification: 50,
    utilityBill: 50,
    nextOfKinName: 100,
    nextOfKinAddress: 200,
    nextOfKinRelationship: 50,
    nextOfKinTel: 20,
    nextOfKinOccupation: 50,
    nextOfKinOfficeAddress: 200,
    nextOfKinEmail: 100,
    estateName: 100,
    numberOfPlots: 10,
    proposedUse: 50,
    proposedType: 50,
    plotSize: 20,
    paymentTerms: 50,
    altContactName: 100,
    altContactAddress: 200,
    altContactRelationship: 50,
    altContactTel: 20,
    altContactEmail: 100,
    referralAgentName: 100,
    referralAgentContact: 20,
    signatureText: 100
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.name) newErrors.name = 'Full name is required';
      if (formData.name && formData.name.length > fieldMaxLengths.name) 
        newErrors.name = `Name must be less than ${fieldMaxLengths.name} characters`;
      if (!formData.residentialAddress) newErrors.residentialAddress = 'Residential address is required';
      if (!formData.occupation) newErrors.occupation = 'Occupation is required';
      if (formData.occupation && formData.occupation.length > fieldMaxLengths.occupation) 
        newErrors.occupation = `Occupation must be less than ${fieldMaxLengths.occupation} characters`;
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.stateOfOrigin) newErrors.stateOfOrigin = 'State of origin is required';
      if (!formData.lga) newErrors.lga = 'LGA is required';
      if (!formData.sex) newErrors.sex = 'Sex is required';
      if (!formData.telephone) newErrors.telephone = 'Telephone is required';
      if (formData.telephone && formData.telephone.length > fieldMaxLengths.telephone) 
        newErrors.telephone = `Telephone must be less than ${fieldMaxLengths.telephone} characters`;
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) 
        newErrors.email = 'Email is invalid';
      if (!formData.identification) newErrors.identification = 'Identification is required';
      if (!formData.utilityBill) newErrors.utilityBill = 'Utility bill is required';
      if (!formData.passportPhoto) newErrors.passportPhoto = 'Passport photo is required';
      if (!formData.identificationFile) newErrors.identificationFile = 'Identification document is required';
      if (!formData.utilityBillFile) newErrors.utilityBillFile = 'Utility bill document is required';
    }
    
    if (step === 2) {
      if (!formData.nextOfKinName) newErrors.nextOfKinName = 'Next of kin name is required';
      if (!formData.nextOfKinAddress) newErrors.nextOfKinAddress = 'Next of kin address is required';
      if (!formData.nextOfKinRelationship) newErrors.nextOfKinRelationship = 'Relationship is required';
      if (!formData.nextOfKinTel) newErrors.nextOfKinTel = 'Next of kin telephone is required';
      if (formData.nextOfKinTel && formData.nextOfKinTel.length > fieldMaxLengths.nextOfKinTel) 
        newErrors.nextOfKinTel = `Telephone must be less than ${fieldMaxLengths.nextOfKinTel} characters`;
      if (!formData.nextOfKinOccupation) newErrors.nextOfKinOccupation = 'Next of kin occupation is required';
      if (formData.nextOfKinEmail && !/\S+@\S+\.\S+/.test(formData.nextOfKinEmail)) 
        newErrors.nextOfKinEmail = 'Email is invalid';
    }
    
    if (step === 3) {
      if (!formData.estateName) newErrors.estateName = 'Estate name is required';
      if (!formData.numberOfPlots) newErrors.numberOfPlots = 'Number of plots is required';
      if (!formData.proposedUse) newErrors.proposedUse = 'Proposed use is required';
      if (!formData.proposedType) newErrors.proposedType = 'Proposed type is required';
      if (!formData.plotSize) newErrors.plotSize = 'Plot size is required';
      if (!formData.paymentTerms) newErrors.paymentTerms = 'Payment terms is required';
    }
    
    if (step === 4) {
      if (!formData.altContactName) newErrors.altContactName = 'Alternative contact name is required';
      if (!formData.altContactAddress) newErrors.altContactAddress = 'Alternative contact address is required';
      if (!formData.altContactTel) newErrors.altContactTel = 'Alternative contact telephone is required';
      if (formData.altContactEmail && !/\S+@\S+\.\S+/.test(formData.altContactEmail)) 
        newErrors.altContactEmail = 'Email is invalid';
    }
    
    if (step === 5) {
      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms and conditions';
      if (!formData.signatureText) newErrors.signatureText = 'Signature is required';
      if (formData.signatureText && formData.signatureText.length > fieldMaxLengths.signatureText) 
        newErrors.signatureText = `Signature must be less than ${fieldMaxLengths.signatureText} characters`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Apply field length restrictions
    if (type !== 'file' && type !== 'checkbox' && fieldMaxLengths[name]) {
      if (value.length > fieldMaxLengths[name]) {
        return; // Don't update if exceeds max length
      }
    }
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };


 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateStep(5)) {
    return;
  }

  setIsSubmitting(true);

  try {
    const data = new FormData();

    // Append all formData fields
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        // For file inputs, we need to handle them differently
        if (formData[key] instanceof File) {
          data.append(key, formData[key], formData[key].name);
        } else {
          data.append(key, formData[key]);
        }
      }
    }

    const response = await fetch("https://musabaha-home-ltd.onrender.com/api/subscriptions", {
      method: "POST",
      body: data,
    });

    const result = await response.json();
console.log("Submitting with plotId:", formData.plotId);

    if (result.success) {
      // Set success state FIRST
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        name: '',
        residentialAddress: '',
        occupation: '',
        officeAddress: '',
        dob: '',
        stateOfOrigin: '',
        lga: '',
        sex: '',
        telephone: '',
        nationality: '',
        officeNumber: '',
        homeNumber: '',
        postalAddress: '',
        email: '',
        identification: '',
        utilityBill: '',
        passportPhoto: null,
        identificationFile: null,
        utilityBillFile: null,
        nextOfKinName: '',
        nextOfKinAddress: '',
        nextOfKinRelationship: '',
        nextOfKinTel: '',
        nextOfKinOccupation: '',
        nextOfKinOfficeAddress: '',
        nextOfKinEmail: '',
        estateName: '',
        numberOfPlots: '',
        proposedUse: '',
        proposedType: '',
        plotSize: '',
        paymentTerms: '',
        altContactName: '',
        altContactAddress: '',
        altContactRelationship: '',
        altContactTel: '',
        altContactEmail: '',
        referralAgentName: '',
        referralAgentContact: '',
        agreedToTerms: false,
        signatureText: '',
        signatureFile: null
      });
      setErrors({});
      
      // Redirect to profile page after 3 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } else {
      alert("❌ Failed to create subscription: " + (result.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Network error submitting subscription form");
  } finally {
    setIsSubmitting(false);
  }
};

   const TermsModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Terms and Conditions</h3>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="terms-content">
              <p><strong>By subscribing to this installment plan for a plot of land at Location Name, the Buyer agrees to the following terms and conditions:</strong></p>
              
              <ol>
                <li>The land is allocated strictly for residential use only. Commercial or industrial use is not permitted unless approved in writing.</li>
                
                <li>
                  <strong>PAYMENT STRUCTURE</strong>
                  <ul>
                    <li>Client agrees to pay the initial deposit before the installment plan begins.</li>
                    <li>Monthly payments must be made on or before the 5th of every month.</li>
                  </ul>
                </li>
                
                <li>
                  <strong>PENALTIES FOR LATE PAYMENT</strong>
                  <ul>
                    <li>₦5,000 penalty applies if payment is delayed beyond 7 days.</li>
                    <li>3 consecutive missed payments may result in allocation cancellation and refund with a 20% administrative fee.</li>
                  </ul>
                </li>
                
                <li>
                  <strong>DEFAULT & CANCELLATION POLICY</strong>
                  <ul>
                    <li>Failure to complete payments within the agreed period may lead to reallocation.</li>
                    <li>Refund requests will be processed within 90 days, minus administrative fees.</li>
                  </ul>
                </li>
                
                <li><strong>ALLocation OF PLOT</strong> - Final allocation and title documents will only be given after full payment.</li>
                
                <li>
                  <strong>TRANSFER OF OWNERSHIP</strong>
                  <ul>
                    <li>Client cannot resell or transfer ownership without company approval (on installment).</li>
                    <li>Ownership change requires a ₦20,000 processing fee.</li>
                  </ul>
                </li>
                
                <li>
                  <strong>Basic Facilities to Be Provided by Seller</strong>
                  <ul>
                    <li>Grading Access roads</li>
                    <li>Drainage on main roads</li>
                    <li>Solar street lights</li>
                    <li>Entry gate and security</li>
                  </ul>
                </li>
                
                <li>
                  <strong>DEVELOPMENT RESTRICTIONS</strong>
                  <ul>
                    <li>No development is allowed until full payment is made.</li>
                    <li>No batchers or temporary structures for residence.</li>
                    <li>No commercial use without approval.</li>
                  </ul>
                </li>
                
                <li>
                  <strong>NON-BUILDING PLAN</strong>
                  <ul>
                    <li>Buyer may hold land undeveloped, but must keep it clean and fenced.</li>
                  </ul>
                </li>
                
                <li>
                  <strong>MENTAL INCAPACITY</strong>
                  <ul>
                    <li>Upon receipt of notice that client/customer is suffering from mental incapacity, the next of kin must properly present the necessary evidence of all relevant documents and claim the right of ownership in support with witnesses.</li>
                  </ul>
                </li>
                
                <li>
                  <strong>DEATH</strong>
                  <ul>
                    <li>Death is an inevitable in nature to every human being in the world. In case we receive the notice of customer death, the contact should immediately be suspended, and only the next of kin/witnesses is liable to present the deed of the deceased attached with court order.</li>
                    <li><strong>Note:</strong> Debt must be settled before continuation or termination of contract.</li>
                  </ul>
                </li>
              </ol>
              
              <div className="payment-mode">
                <h5>PAYMENT MODE</h5>
                <div className="payment-options">
                  <span>Cheque</span>
                  <span>Bank Draft</span>
                  <span>E-Banking</span>
                </div>
                <p>1. All payments shall be made into MUSABAHA HOMES LTD. designated accounts.</p>
                <p>2. Allocations are done on the basis of first come first serve at full payment.</p>
                <p>3. This subscription form is free.</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-button" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Success message component
  const SuccessMessage = () => (
    <div className="success-overlay">
      <div className="success-message">
        <div className="success-icon">✅</div>
        <h2>Application Submitted Successfully!</h2>
        <p>Thank you for your application. Your subscription is under review.</p>
        <p>Please wait for approval. You will be redirected to your profile shortly.</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );

  if (submitSuccess) {
    return <SuccessMessage />;
  }

   return (
    <div className="subscription-form-container">
      <div className="form-overlay">
        <form onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>MUSABAHA HOMES LTD.</h2>
            <h3>PLOT SUBSCRIPTION FORM</h3>
          </div>

          <div className="progress-indicator">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className={`step ${step === num ? 'active' : ''}`}>
                {num}
              </div>
            ))}
          </div>

          {/* Step 1: Subscriber's Data */}
          {step === 1 && (
            <div className="form-section">
              <h4>Subscriber's Data</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <select name="title" value={formData.title} onChange={handleChange} required>
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                  </select>
                  {errors.title && <span className="error-text">{errors.title}</span>}
                </div>
                
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.name}
                    required 
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Residential Address *</label>
                <input 
                  type="text" 
                  name="residentialAddress" 
                  value={formData.residentialAddress} 
                  onChange={handleChange} 
                  maxLength={fieldMaxLengths.residentialAddress}
                  required 
                />
                {errors.residentialAddress && <span className="error-text">{errors.residentialAddress}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Occupation *</label>
                  <input 
                    type="text" 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.occupation}
                    required 
                  />
                  {errors.occupation && <span className="error-text">{errors.occupation}</span>}
                </div>
                
                <div className="form-group">
                  <label>Office Address</label>
                  <input 
                    type="text" 
                    name="officeAddress" 
                    value={formData.officeAddress} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.officeAddress}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                  {errors.dob && <span className="error-text">{errors.dob}</span>}
                </div>
                
                <div className="form-group">
                  <label>State of Origin *</label>
                  <input 
                    type="text" 
                    name="stateOfOrigin" 
                    value={formData.stateOfOrigin} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.stateOfOrigin}
                    required 
                  />
                  {errors.stateOfOrigin && <span className="error-text">{errors.stateOfOrigin}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>LGA *</label>
                  <input 
                    type="text" 
                    name="lga" 
                    value={formData.lga} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.lga}
                    required 
                  />
                  {errors.lga && <span className="error-text">{errors.lga}</span>}
                </div>
                
                <div className="form-group">
                  <label>Sex *</label>
                  <select name="sex" value={formData.sex} onChange={handleChange} required>
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && <span className="error-text">{errors.sex}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Telephone *</label>
                  <input 
                    type="tel" 
                    name="telephone" 
                    value={formData.telephone} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.telephone}
                    required 
                  />
                  {errors.telephone && <span className="error-text">{errors.telephone}</span>}
                </div>
                
                <div className="form-group">
                  <label>Nationality *</label>
                  <input 
                    type="text" 
                    name="nationality" 
                    value={formData.nationality} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.nationality}
                    required 
                  />
                  {errors.nationality && <span className="error-text">{errors.nationality}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Office Number</label>
                  <input 
                    type="tel" 
                    name="officeNumber" 
                    value={formData.officeNumber} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.officeNumber}
                  />
                </div>
                
                <div className="form-group">
                  <label>Home Number</label>
                  <input 
                    type="tel" 
                    name="homeNumber" 
                    value={formData.homeNumber} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.homeNumber}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Address</label>
                  <input 
                    type="text" 
                    name="postalAddress" 
                    value={formData.postalAddress} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.postalAddress}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.email}
                    required 
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Means of Identification *</label>
                  <select name="identification" value={formData.identification} onChange={handleChange} required>
                    <option value="">Select ID</option>
                    <option value="National ID">National ID</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="International Passport">International Passport</option>
                    <option value="Voter's Card">Voter's Card</option>
                  </select>
                  {errors.identification && <span className="error-text">{errors.identification}</span>}
                </div>
                
                <div className="form-group">
                  <label>Utility Bill *</label>
                  <select name="utilityBill" value={formData.utilityBill} onChange={handleChange} required>
                    <option value="">Select Utility Bill</option>
                    <option value="Electricity Bill">Electricity Bill</option>
                    <option value="Water Bill">Water Bill</option>
                    <option value="Waste Bill">Waste Bill</option>
                  </select>
                  {errors.utilityBill && <span className="error-text">{errors.utilityBill}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Passport Photo *</label>
                  <input type="file" name="passportPhoto" onChange={handleChange} accept="image/*" required />
                  <small>Upload a recent passport photograph</small>
                  {errors.passportPhoto && <span className="error-text">{errors.passportPhoto}</span>}
                </div>
                
                <div className="form-group">
                  <label>Identification Document *</label>
                  <input type="file" name="identificationFile" onChange={handleChange} accept="image/*,.pdf" required />
                  <small>Upload a clear copy of your ID</small>
                  {errors.identificationFile && <span className="error-text">{errors.identificationFile}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Utility Bill Document *</label>
                <input type="file" name="utilityBillFile" onChange={handleChange} accept="image/*,.pdf" required />
                <small>Upload a clear copy of your utility bill</small>
                {errors.utilityBillFile && <span className="error-text">{errors.utilityBillFile}</span>}
              </div>
            </div>
          )}

          {/* Step 2: Next of Kin's Data */}
          {step === 2 && (
            <div className="form-section">
              <h4>Next of Kin's Data</h4>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="nextOfKinName" 
                  value={formData.nextOfKinName} 
                  onChange={handleChange} 
                  maxLength={fieldMaxLengths.nextOfKinName}
                  required 
                />
                {errors.nextOfKinName && <span className="error-text">{errors.nextOfKinName}</span>}
              </div>
              
              <div className="form-group">
                <label>Address *</label>
                <input 
                  type="text" 
                  name="nextOfKinAddress" 
                  value={formData.nextOfKinAddress} 
                  onChange={handleChange} 
                  maxLength={fieldMaxLengths.nextOfKinAddress}
                  required 
                />
                {errors.nextOfKinAddress && <span className="error-text">{errors.nextOfKinAddress}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Relationship *</label>
                  <input 
                    type="text" 
                    name="nextOfKinRelationship" 
                    value={formData.nextOfKinRelationship} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.nextOfKinRelationship}
                    required 
                  />
                  {errors.nextOfKinRelationship && <span className="error-text">{errors.nextOfKinRelationship}</span>}
                </div>
                
                <div className="form-group">
                  <label>Telephone *</label>
                  <input 
                    type="tel" 
                    name="nextOfKinTel" 
                    value={formData.nextOfKinTel} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.nextOfKinTel}
                    required 
                  />
                  {errors.nextOfKinTel && <span className="error-text">{errors.nextOfKinTel}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Occupation *</label>
                  <input 
                    type="text" 
                    name="nextOfKinOccupation" 
                    value={formData.nextOfKinOccupation} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.nextOfKinOccupation}
                    required 
                  />
                  {errors.nextOfKinOccupation && <span className="error-text">{errors.nextOfKinOccupation}</span>}
                </div>
                
                <div className="form-group">
                  <label>Office Address</label>
                  <input 
                    type="text" 
                    name="nextOfKinOfficeAddress" 
                    value={formData.nextOfKinOfficeAddress} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.nextOfKinOfficeAddress}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="nextOfKinEmail" 
                  value={formData.nextOfKinEmail} 
                  onChange={handleChange} 
                  maxLength={fieldMaxLengths.nextOfKinEmail}
                />
                {errors.nextOfKinEmail && <span className="error-text">{errors.nextOfKinEmail}</span>}
              </div>
            </div>
          )}

          {/* Step 3: Plot Information */}
{step === 3 && (
  <div className="form-section">
    <h4>Plot Information</h4>

    {/* Select Plot (from API) */}
    <div className="form-group">
      <label>Select Plot *</label>
 <select
  name="plotId"
  value={formData.plotId}
  onChange={(e) => {
    const plotId = e.target.value;
    const selected = plots.find((p) => p.id === parseInt(plotId));
    setFormData({
      ...formData,
      plotId, // ✅ match DB field
      estateName: selected?.location || "",
      numberOfPlots: 1, // default 1
      proposedUse: "",
      proposedType: "",
      plotSize: selected?.dimension || "",
      price: selected?.price || "",
      paymentTerms: "",
    });

    // ✅ log for debugging
    console.log("Selected plotId:", plotId, "Full plot:", selected);
  }}
  required
>
  <option value="">-- Select Available Plot --</option>
  {plots.map((plot) => (
    <option key={plot.id} value={plot.id}>
      {plot.number} - {plot.location} ({plot.dimension}) - ₦{plot.price}
    </option>
  ))}
</select>

      {errors.selectedPlot && (
        <span className="error-text">{errors.selectedPlot}</span>
      )}
    </div>

    {/* Number of Plots & Proposed Use */}
    <div className="form-row">
      <div className="form-group">
        <label>Number of Plots *</label>
        <input
          type="number"
          name="numberOfPlots"
          value={formData.numberOfPlots}
          onChange={handleChange}
          min="1"
          maxLength={fieldMaxLengths.numberOfPlots}
          required
        />
        {errors.numberOfPlots && (
          <span className="error-text">{errors.numberOfPlots}</span>
        )}
      </div>

      <div className="form-group">
        <label>Proposed Use *</label>
        <select
          name="proposedUse"
          value={formData.proposedUse}
          onChange={handleChange}
          required
        >
          <option value="">Select Use</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
          <option value="Agricultural">Agricultural</option>
        </select>
        {errors.proposedUse && (
          <span className="error-text">{errors.proposedUse}</span>
        )}
      </div>
    </div>

    {/* Proposed Type, Plot Size & Price */}
    <div className="form-row">
      <div className="form-group">
        <label>Proposed Type *</label>
        <select
          name="proposedType"
          value={formData.proposedType}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="Bungalow">Bungalow</option>
          <option value="Duplex">Duplex</option>
          <option value="Block of Flats">Block of Flats</option>
          <option value="Warehouse">Warehouse</option>
        </select>
        {errors.proposedType && (
          <span className="error-text">{errors.proposedType}</span>
        )}
      </div>

      <div className="form-group">
        <label>Plot Size *</label>
        <input
          type="text"
          name="plotSize"
          value={formData.plotSize}
          onChange={handleChange}
          maxLength={fieldMaxLengths.plotSize}
          required
          readOnly
        />
        {errors.plotSize && (
          <span className="error-text">{errors.plotSize}</span>
        )}
      </div>

      <div className="form-group">
        <label>Price (₦)</label>
        <input
          type="text"
          name="price"
          value={formData.price}
          readOnly
        />
      </div>
    </div>

    {/* Payment Terms */}
    <div className="form-group">
      <label>Payment Terms *</label>
      <select
        name="paymentTerms"
        value={formData.paymentTerms}
        onChange={handleChange}
        required
      >
        <option value="">Select Payment Terms</option>
        <option value="Full Payment">Full Payment</option>
        <option value="Installment - 3 Months">Installment - 3 Months</option>
        <option value="Installment - 6 Months">Installment - 6 Months</option>
        <option value="Installment - 12 Months">Installment - 12 Months</option>
      </select>
      {errors.paymentTerms && (
        <span className="error-text">{errors.paymentTerms}</span>
      )}
    </div>
  </div>
)}



          {/* Step 4: Alternative Contact & Referral */}
          {step === 4 && (
            <div className="form-section">
              <h4>Alternative Contact Person</h4>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="altContactName" 
                  value={formData.altContactName} 
                  onChange={handleChange} 
                  maxLength={fieldMaxLengths.altContactName}
                  required 
                />
                {errors.altContactName && <span className="error-text">{errors.altContactName}</span>}
              </div>
              
              <div className="form-group">
                <label>Address *</label>
                <input 
                  type="text" 
                  name="altContactAddress" 
                  value={formData.altContactAddress} 
                  onChange={handleChange} 
                  maxLength={fieldMaxLengths.altContactAddress}
                  required 
                />
                {errors.altContactAddress && <span className="error-text">{errors.altContactAddress}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Relationship</label>
                  <input 
                    type="text" 
                    name="altContactRelationship" 
                    value={formData.altContactRelationship} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.altContactRelationship}
                  />
                </div>
                
                <div className="form-group">
                  <label>Telephone *</label>
                  <input 
                    type="tel" 
                    name="altContactTel" 
                    value={formData.altContactTel} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.altContactTel}
                    required 
                  />
                  {errors.altContactTel && <span className="error-text">{errors.altContactTel}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="altContactEmail" 
                  value={formData.altContactEmail} 
                  onChange={handleChange} 
                  maxLength={fieldMaxLengths.altContactEmail}
                />
                {errors.altContactEmail && <span className="error-text">{errors.altContactEmail}</span>}
              </div>
              
              <h4 style={{marginTop: '30px'}}>Referral Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Referral Agent Name</label>
                  <input 
                    type="text" 
                    name="referralAgentName" 
                    value={formData.referralAgentName} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.referralAgentName}
                  />
                </div>
                
                <div className="form-group">
                  <label>Referral Agent Contact</label>
                  <input 
                    type="text" 
                    name="referralAgentContact" 
                    value={formData.referralAgentContact} 
                    onChange={handleChange} 
                    maxLength={fieldMaxLengths.referralAgentContact}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Agreement */}
          {step === 5 && (
            <div className="form-section">
              <h4>Agreement</h4>
              
              <div className="terms-preview">
                <p>By submitting this form, you agree to our Terms and Conditions</p>
                <button type="button" className="view-terms-btn" onClick={() => setShowModal(true)}>
                  View Terms and Conditions
                </button>
              </div>
              
              <div className="form-group checkbox-label">
                <input 
                  type="checkbox" 
                  name="agreedToTerms" 
                  checked={formData.agreedToTerms} 
                  onChange={handleChange} 
                  required 
                />
                <label>I agree to the terms and conditions</label>
                {errors.agreedToTerms && <span className="error-text">{errors.agreedToTerms}</span>}
              </div>
              
              <div className="form-group">
                <label>Signature *</label>
                <input 
                  type="text" 
                  name="signatureText" 
                  value={formData.signatureText} 
                  onChange={handleChange} 
                  placeholder="Type your full name as signature" 
                  maxLength={fieldMaxLengths.signatureText}
                  required 
                />
                {errors.signatureText && <span className="error-text">{errors.signatureText}</span>}
              </div>
              
              <div className="form-group">
                <label>Upload Signature (Optional)</label>
                <input type="file" name="signatureFile" onChange={handleChange} accept="image/*" />
                <small>Upload an image of your signature if preferred</small>
              </div>
            </div>
          )}

          <div className="step-actions">
            {step > 1 ? (
              <button type="button" className="prev-btn" onClick={handlePrev}>
                Previous
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 5 ? (
              <button type="button" className="next-btn" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button type="submit" className="submit-btn">
                Submit Subscription
              </button>
            )}
          </div>
        </form>

   <div className="company-footer">
        <p><strong>MUSABAHA HOMES LTD.</strong></p>
        <p>No. 015, City Plaza Along Ring Road Western Bypass Along Yankaba Road, Kano State.</p>
        <p>📞 TEL: +2349084220705, +2349039108863, +2347038192719</p>
        <p>📧 Email: musababahomesth@gmail.com</p>
      </div>
      </div>

      <TermsModal />
    </div>
  );
};

export default SubscriptionForm;