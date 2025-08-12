// import React, { useState, useRef } from "react";

// interface FormData {
//   name: string;
//   email: string;
//   message: string;
// }

// interface FilePayload {
//   fileName: string;
//   contentType: string;
//   content: string; // base64
// }

// // Add after existing interfaces
// interface FileWithPreview extends File {
//   preview?: string;
// }

// const ExternalForm = () => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     message: "",
//   });
//   // Update the component state
//   const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const Url = "https://prod-25.centralindia.logic.azure.com:443/workflows/5d163597298b424185cb0cb9e4b9b176/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9W4uNSJYqSiUASKzpRIEIJUm9u3LoHXt6ugpWqmJc7U";

//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const result = reader.result as string;
//         const base64 = result.split(",")[1];
//         resolve(base64);
//       };
//       reader.onerror = (err) => reject(err);
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files) {
//       const fileArray = Array.from(files) as FileWithPreview[];
//       const totalSize = [...selectedFiles, ...fileArray].reduce((sum, file) => sum + file.size, 0);
      
//       // Limit total size to 10MB
//       const MAX_TOTAL_SIZE = 10 * 1024 * 1024;
      
//       if (totalSize > MAX_TOTAL_SIZE) {
//         alert("Total file size exceeds 10MB limit");
//         return;
//       }

//       // Limit total number of files
//       if (selectedFiles.length + fileArray.length > 5) {
//         alert("Maximum 5 files allowed");
//         return;
//       }
      
//       // Add new files to existing selection
//       setSelectedFiles(prevFiles => [...prevFiles, ...fileArray]);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Update the handleSubmit function to show progress
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name || !formData.email || !formData.message) {
//       alert("Please fill in all required fields.");
//       return;
//     }

//     if (selectedFiles.length > 5) { // Example limit of 5 files
//       alert("Maximum 5 files allowed");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Convert all files to base64 in parallel
//       const filesPayload: FilePayload[] = await Promise.all(
//         selectedFiles.map(async (file) => {
//           const base64 = await fileToBase64(file);
//           return {
//             fileName: file.name,
//             contentType: file.type,
//             content: base64,
//           };
//         })
//       );

//       const payload = {
//         name: formData.name,
//         email: formData.email,
//         message: formData.message,
//         files: filesPayload,
//       };

//       const response = await fetch(Url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         alert("Form submitted successfully!");
//         setFormData({ name: "", email: "", message: "" });
//         setSelectedFiles([]);
//         if (fileInputRef.current) fileInputRef.current.value = "";
//       } else {
//         throw new Error(`Server responded with status: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Submission error:", error);
//       alert(`Failed to submit form: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Add a function to remove individual files
//   const removeFile = (index: number) => {
//     setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Name</label>
//         <input
//           type="text"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
//           required
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Email</label>
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
//           required
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Message</label>
//         <textarea
//           name="message"
//           value={formData.message}
//           onChange={handleChange}
//           rows={4}
//           className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
//           required
//         ></textarea>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">
//           Attachments (Optional, max 5 files, total size: 10MB)
//         </label>
//         <input
//           ref={fileInputRef}
//           type="file"
//           onChange={handleFileChange}
//           multiple
//           className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
//           accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
//         />
//         {selectedFiles.length > 0 && (
//           <div className="mt-2 text-sm text-gray-500">
//             Selected files ({selectedFiles.length}/5):
//             <ul className="list-disc pl-5">
//               {selectedFiles.map((file, index) => (
//                 <li key={index} className="flex items-center justify-between">
//                   <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(index)}
//                     className="ml-2 text-red-500 hover:text-red-700"
//                   >
//                     ×
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//       >
//         {isSubmitting ? "Submitting..." : "Submit"}
//       </button>
//     </form>
//   );
// };

// export default ExternalForm;

// import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

// interface FormData {
//     CustomerType: string;
//     regionCity: string;
//     applicationDate?: string;
//     customerchoice?: string;
//     tradeNameArabic: string;
//     tradeNameEnglish: string;
//     businessType: string;
//     commercialRegNo: string;
//     companyRegistrationYear: string;
//     unifiedNo: string;
//     vatNo: string;
//     mainActivity: string;
//     managingDirector: string;
//     authorizedSignatory: string;
//     noOfBranches: string;
//     noOfEmployees: string;
//     nationalAddress: string;
//     officialPhone: string;
//     mobileNo: string;
//     officialWebsite: string;
//     paymentCycle: string;
//     poApproverName: string;
//     approverName: string;

// }


// interface ContactDetail {
//   Name: string;
//   Designation: string;
//   Email: string;
//   Contact: string;
// }


// const CreditCustomers = () => {


// const [contacts, setContacts] = React.useState<ContactDetail[]>(
//   Array.from({ length: 5 }, () => ({ Name: "", Designation: "", Email: "", Contact: "" }))
// );



//     // const fileToBase64 = (file: File): Promise<string> =>
//     //     new Promise((resolve, reject) => {
//     //         const reader = new FileReader();
//     //         reader.readAsDataURL(file);
//     //         reader.onload = () => {
//     //             const base64 = (reader.result as string).split(",")[1];
//     //             resolve(base64);
//     //         };
//     //         reader.onerror = (error) => reject(error);
//     //     });
//   const handleContactChange = (index: number, field: keyof ContactDetail, value: string) => {
//   const updatedContacts = [...contacts];
//   updatedContacts[index][field] = value;
//   setContacts(updatedContacts);
// };



//     const initialFormData: FormData = {
//         CustomerType: 'CreditCustomers',
//         regionCity: '',
//         applicationDate: new Date().toISOString().split('T')[0],
//         customerchoice: '',
//         tradeNameArabic: '',
//         tradeNameEnglish: '',
//         businessType: '',
//         commercialRegNo: '',
//         companyRegistrationYear: '',
//         unifiedNo: '',
//         vatNo: '',
//         mainActivity: '',
//         managingDirector: '',
//         authorizedSignatory: '',
//         noOfBranches: '',
//         noOfEmployees: '',
//         nationalAddress: '',
//         officialPhone: '',
//         mobileNo: '',
//         officialWebsite: '',
//         paymentCycle: '',
//         poApproverName: '',
//         approverName: '',


//     };

//     const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { value, checked } = e.target;
//         setFormData((prev) => {
//             let updatedList = prev.businessType ? prev.businessType.split(", ") : [];

//             if (checked) {
//                 updatedList.push(value);
//             } else {
//                 updatedList = updatedList.filter((item) => item !== value);
//             }

//             return { ...prev, businessType: updatedList.join(", ") };
//         });
//     };
//     const [formData, setFormData] = React.useState<FormData>({ ...initialFormData });
//     const [loading, setLoading] = React.useState(false);
//     const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

//     const Url = "https://prod-25.centralindia.logic.azure.com:443/workflows/5d163597298b424185cb0cb9e4b9b176/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9W4uNSJYqSiUASKzpRIEIJUm9u3LoHXt6ugpWqmJc7U";

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     // const handleSubmit = async (e: React.FormEvent) => {
//     //     e.preventDefault();
//     //     setLoading(true);
//     //     setStatusMessage(null);

//     //     try {
//     //         const response = await fetch(Url, {
//     //             method: "POST",
//     //             headers: { "Content-Type": "application/json" },
//     //             body: JSON.stringify(formData),
//     //         });

//     //         if (response.ok) {
//     //             setStatusMessage("Form submitted successfully!");
//     //             setFormData({ ...initialFormData });
//     //         } else {
//     //             throw new Error(`Server responded with status: ${response.status}`);
//     //         }
//     //     } catch (error) {
//     //         console.error("Submission error:", error);
//     //         setStatusMessage("Failed to submit form. Please try again.");
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };


//     // const handleSubmit = async (e: React.FormEvent) => {
//     //     e.preventDefault();
//     //     setLoading(true);
//     //     setStatusMessage(null);

//     //     try {
//     //         // Convert signature files to base64 before sending
//     //         const contactsWithBase64 = await Promise.all(
//     //             contacts.map(async (contact) => {
                 
//     //                 return {
//     //                     Name: contact.Name,
//     //                     Designation: contact.Designation,
//     //                     Email: contact.Email,
//     //                     Contact: contact.Contact,
                    
                       
//     //                 };
//     //             })
//     //         );

//     //         // Combine your form data with contacts
//     //         const payload = {
//     //             ...formData,
//     //             contacts: contactsWithBase64,
//     //         };

//     //         const response = await fetch(Url, {
//     //             method: "POST",
//     //             headers: { "Content-Type": "application/json" },
//     //             body: JSON.stringify(payload),
//     //         });

//     //         if (response.ok) {
//     //             setStatusMessage("Form submitted successfully!");
//     //             setFormData({ ...initialFormData });
//     //             setContacts(Array(5).fill({ Name: "", Designation: "", Email: "", Contact: "", SignatureFile: null }));
//     //         } else {
//     //             throw new Error(`Server responded with status: ${response.status}`);
//     //         }
//     //     } catch (error) {
//     //         console.error("Submission error:", error);
//     //         setStatusMessage("Failed to submit form. Please try again.");
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setLoading(true);
//   setStatusMessage(null);

//   try {
//     // Prepare payload with contacts and other form data
//     const payload = {
//       ...formData,
//       contacts: contacts,
//     };

//     const response = await fetch(Url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (response.ok) {
//       setStatusMessage("Form submitted successfully!");
//       setFormData({ ...initialFormData });
//       setContacts(Array.from({ length: 5 }, () => ({ Name: "", Designation: "", Email: "", Contact: "" })));
//     } else {
//       throw new Error(`Server responded with status: ${response.status}`);
//     }
//   } catch (error) {
//     console.error("Submission error:", error);
//     setStatusMessage("Failed to submit form. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// };
    
//     return (
//         <div className="mt-4" style={{ color: 'black', width: '91vw', marginLeft: '4vw' }}>
//             <form onSubmit={handleSubmit}>
//                 {/* --- CARD 1: CUSTOMER INFORMATION --- */}
//                 <div className="card mb-5" style={{ borderRadius: '15px', border: '2px solid #FCCE07' }}>
//                     <div className="mb-2 text-center pt-2">
//                         <h4 className="mb-0" style={{ color: '#1c325d', fontSize: '1.5rem', fontWeight: 'bold' }}>
//                             Credit Customers
//                         </h4>
//                     </div>
//                     <div className="card-body" style={{ color: 'black' }}>
//                         {/* Request Information */}
//                         <div className="mb-5">
//                             <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                                 <h6 className="mb-0">Request Information / معلومات الطلب</h6>
//                             </div>
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="regionCity" className="form-label">
//                                         Region / City / المنطقة / المدينة <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="regionCity"
//                                         name="regionCity"
//                                         type="text"
//                                         className="form-control"
//                                         placeholder="Enter region or city"
//                                         onChange={handleChange}
//                                         value={formData.regionCity}
//                                     />
//                                 </div>
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="applicationDate" className="form-label">
//                                         Application Date / تاريخ الطلب <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="applicationDate"
//                                         type="date"
//                                         name="applicationDate"
//                                         className="form-control"
//                                         value={formData.applicationDate}
//                                         onChange={handleChange}
//                                         readOnly
//                                     />
//                                 </div>
//                             </div>
//                             <div className="mb-3">
//                                 <label className="form-label d-block">
//                                     Customer Type / نوع العميل <span className="text-danger">*</span>
//                                 </label>
//                                 <div className="d-flex flex-wrap">
//                                     {['Former', 'Current', 'New'].map((type) => (
//                                         <div className="form-check form-check-inline me-4" key={type}>
//                                             <input
//                                                 className="form-check-input"
//                                                 type="radio"
//                                                 name="customerchoice"
//                                                 id={`customerType${type}`}
//                                                 value={type}
//                                                 checked={formData.customerchoice === type}
//                                                 onChange={handleChange}
//                                             />
//                                             <label className="form-check-label" htmlFor={`customerType${type}`}>
//                                                 {type} / {type === 'Former' ? 'سابق' : type === 'Current' ? 'قائم' : 'جدید'}
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Basic Information */}
//                         <div className="mb-5">
//                             <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                                 <h6 className="mb-0">Basic Information / المعلومات الأساسية</h6>
//                             </div>
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="tradeNameArabic" className="form-label">
//                                         Trade Name (Arabic) <span className="text-danger">*</span>
//                                         <br />
//                                         اسم العميل التجاري (عربي)
//                                     </label>
//                                     <br />
//                                     <br />
//                                     <input
//                                         id="tradeNameArabic"
//                                         type="text"
//                                         name="tradeNameArabic"
//                                         className="form-control"
//                                         placeholder="Enter Arabic trade name"
//                                         style={{ textAlign: 'right' }}
//                                         value={formData.tradeNameArabic}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="tradeNameEnglish" className="form-label">
//                                         Trade Name (English) <span className="text-danger">*</span>
//                                         <br />
//                                         اسم العميل التجاري (انجليزي)
//                                     </label>
//                                     <br />
//                                     <br />
//                                     <input
//                                         id="tradeNameEnglish"
//                                         type="text"
//                                         name="tradeNameEnglish"
//                                         className="form-control"
//                                         placeholder="Enter English trade name"
//                                         value={formData.tradeNameEnglish}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="mb-3">
//                                 <label className="form-label d-block">
//                                     Facility Type / نوع المنشأة <span className="text-danger">*</span>
//                                 </label>
//                                 <div className="row">
//                                     <div className="col-md-6">
//                                         {['Sole Proprietorship', 'Joint-stock'].map((type) => (
//                                             <div className="form-check" key={type}>
//                                                 <input
//                                                     className="form-check-input"
//                                                     type="checkbox"
//                                                     name="businessType"
//                                                     id={type.toLowerCase().replace(' ', '')}
//                                                     value={type}
//                                                     checked={formData.businessType.includes(type)}
//                                                     onChange={handleCheckboxChange}
//                                                 />
//                                                 <label className="form-check-label" htmlFor={type.toLowerCase().replace(' ', '')}>
//                                                     {type} / {type === 'Sole Proprietorship' ? 'فردية' : 'مساهمة'}
//                                                 </label>
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <div className="col-md-6">
//                                         {['Partnership', 'Limited Liability'].map((type) => (
//                                             <div className="form-check" key={type}>
//                                                 <input
//                                                     className="form-check-input"
//                                                     type="checkbox"
//                                                     name="businessType"
//                                                     id={type.toLowerCase().replace(' ', '')}
//                                                     value={type}
//                                                     checked={formData.businessType.includes(type)}
//                                                     onChange={handleCheckboxChange}
//                                                 />
//                                                 <label className="form-check-label" htmlFor={type.toLowerCase().replace(' ', '')}>
//                                                     {type} / {type === 'Partnership' ? 'تضامنية' : 'مسؤولية محدودة'}
//                                                 </label>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="row">
//                                 <div className="col-6 mb-3">
//                                     <label htmlFor="commercialRegNo" className="form-label">
//                                         Commercial Reg. No. <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="commercialRegNo"
//                                         type="text"
//                                         name="commercialRegNo"
//                                         className="form-control"
//                                         placeholder="Enter commercial registration number"
//                                         value={formData.commercialRegNo}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                                 <div className="col-6 mb-3">
//                                     <label htmlFor="expiryDate" className="form-label">
//                                         Company registration year <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="registrationyear"
//                                         type="text"
//                                         name="companyRegistrationYear"
//                                         className="form-control"
//                                         value={formData.companyRegistrationYear}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="row mb-3">
//                                 <label htmlFor="UnifiedNo" className="col-md-12 col-form-label">
//                                     Unified No
//                                 </label>
//                                 <div className="col-md-12">
//                                     <input
//                                         id="UnifiedNo"
//                                         type="text"
//                                         name="unifiedNo"
//                                         className="form-control"
//                                         value={formData.unifiedNo}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="mb-3">
//                                 <label htmlFor="vatNo" className="form-label">
//                                     VAT No. / الرقم الضريبي <span className="text-danger">*</span>
//                                 </label>
//                                 <input
//                                     id="vatNo"
//                                     type="text"
//                                     name="vatNo"
//                                     placeholder="Enter VAT number"
//                                     className="form-control"
//                                     value={formData.vatNo}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="mb-3">
//                                 <label htmlFor="mainActivity" className="form-label">
//                                     Main Activity / النشاط الرئيسي <span className="text-danger">*</span>
//                                 </label>
//                                 <input
//                                     id="mainActivity"
//                                     name="mainActivity"
//                                     placeholder="Enter main activity"
//                                     type="text"
//                                     className="form-control"

//                                     value={formData.mainActivity}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="mb-3">
//                                 <label htmlFor="managingDirector" className="form-label">
//                                     Managing Director / المدير المسئول <span className="text-danger">*</span>
//                                 </label>
//                                 <input
//                                     id="managingDirector"
//                                     type="text"
//                                     name="managingDirector"
//                                     className="form-control"
//                                     placeholder="Enter managing director name"
//                                     value={formData.managingDirector}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="mb-3">
//                                 <label htmlFor="authorizedSignatory" className="form-label">
//                                     Authorized Signatory / المفوض بالتوقيع <span className="text-danger">*</span>
//                                 </label>
//                                 <input
//                                     id="authorizedSignatory"
//                                     type="text"
//                                     className="form-control"
//                                     name="authorizedSignatory"
//                                     placeholder="Enter authorized signatory name"
//                                     value={formData.authorizedSignatory}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="noOfBranches" className="form-label">
//                                         No. of Branches / عدد الفروع <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="noOfBranches"
//                                         type="text"
//                                         className="form-control"
//                                         name="noOfBranches"
//                                         placeholder="Enter number of branches"
//                                         value={formData.noOfBranches}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="noOfEmployees" className="form-label">
//                                         No. of Employees / عدد الموظفين <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="noOfEmployees"
//                                         type="text"
//                                         className="form-control"
//                                         name="noOfEmployees"
//                                         placeholder="Enter number of employees"
//                                         value={formData.noOfEmployees}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="mb-3">
//                                 <label htmlFor="nationalAddress" className="form-label">
//                                     National Address / العنوان الوطني <span className="text-danger">*</span>
//                                 </label>
//                                 <input
//                                     id="nationalAddress"
//                                     type="text"
//                                     className="form-control"
//                                     name="nationalAddress"
//                                     placeholder="Enter national address"
//                                     value={formData.nationalAddress}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="officialPhone" className="form-label">
//                                         Official Phone / الهاتف الرسمي <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="officialPhone"
//                                         type="tel"
//                                         className="form-control"
//                                         name="officialPhone"
//                                         placeholder="Enter official phone"

//                                         value={formData.officialPhone}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="mobileNo" className="form-label">
//                                         Mobile No / الجوال <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="mobileNo"
//                                         type="tel"
//                                         className="form-control"
//                                         name="mobileNo"
//                                         placeholder="Enter mobile number"
//                                         value={formData.mobileNo}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="mb-3">
//                                 <label htmlFor="officialWebsite" className="form-label">
//                                     Official Website / الموقع الالكتروني
//                                 </label>
//                                 <input
//                                     id="officialWebsite"
//                                     type="url"
//                                     className="form-control"
//                                     name="officialWebsite"
//                                     placeholder="Enter official website URL"
//                                     value={formData.officialWebsite}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                         </div>

//                         {/* Authorized Finance and Procurement Department Staff */}
//                         <div className="mb-5">
//                             <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                                 <h6 className="mb-0">
//                                     Authorized Finance and Procurement Department Staff / المعتمدين في قسم المالية و المشتريات لدى الشركة
//                                 </h6>
//                             </div>
//                             <div className="row">
//                                 <div className="col-md-4">
//                                     <div className="mb-3">
//                                         <label htmlFor="PymentCycle" className="form-label">
//                                             Payment cycle <span className="text-danger">*</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             name="paymentCycle"
//                                             placeholder="Enter Payment cycle"
//                                             className="form-control"
//                                             id="PymentCycle"
//                                             value={formData.paymentCycle}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="col-md-4">
//                                     <div className="mb-3">
//                                         <label htmlFor="POApproverName" className="form-label">
//                                             PO Approver Name <span className="text-danger">*</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             className="form-control"
//                                             id="poApproverName"
//                                             name="poApproverName"
//                                             placeholder="Enter PO approver Name"
//                                             value={formData.poApproverName}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="col-md-4">
//                                     <div className="mb-3">
//                                         <label htmlFor="ApproverName" className="form-label">
//                                             Payment Approver Name <span className="text-danger">*</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             className="form-control"
//                                             id="ApproverName"
//                                             name="approverName"
//                                             placeholder="Enter Payment approver Name"
//                                             value={formData.approverName}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="row mb-3">
//                                     <label htmlFor="ContractDetails" className="col-form-label">
//                                         Contact Details
//                                     </label>
//                                     <div className="col-md-12">
//                                         {/* <table className="table table-bordered text-center" style={{ border: '2px solid #F4C542', backgroundColor: '#FFF8E1' }}>
//                                             <thead style={{ backgroundColor: '#F4C542' }}>
//                                                 <tr>
//                                                     <th>الاسم<br />Name</th>
//                                                     <th>المسمى الوظيفي<br />Designation</th>
//                                                     <th>البريد الإلكتروني<br />Email</th>
//                                                     <th>رقم التواصل<br />Contact Details</th>
//                                                     <th>التوقيع<br />Signature</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {Array.from({ length: 5 }).map((_, i) => (
//                                                     <tr key={i}>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="text"
//                                                                 className="form-control"
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="text"
//                                                                 className="form-control"
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="text"
//                                                                 className="form-control"
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="text"
//                                                                 className="form-control"
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <div className="mt-1">
//                                                                 <input
//                                                                     type="file"
//                                                                     accept="image/*,.pdf"
//                                                                     id={`hidden-file-input-${i}`}
//                                                                     style={{ display: 'none' }}
//                                                                 />
//                                                                 <button
//                                                                     style={{ marginRight: '153px', marginBlock: '24px' }}
//                                                                     type="button"
//                                                                     className="btn btn-outline-primary btn-sm mt-4"
//                                                                 >
//                                                                     Signature Upload
//                                                                 </button>
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table> */}


//                                         <table className="table table-bordered text-center" style={{ border: '2px solid #F4C542', backgroundColor: '#FFF8E1' }}>
//                                             <thead style={{ backgroundColor: '#F4C542' }}>
//                                                 <tr>
//                                                     <th>الاسم<br />Name</th>
//                                                     <th>المسمى الوظيفي<br />Designation</th>
//                                                     <th>البريد الإلكتروني<br />Email</th>
//                                                     <th>رقم التواصل<br />Contact Details</th>
//                                                     <th>التوقيع<br />Signature</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {contacts.map((contact, i) => (
//                                                     <tr key={i}>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="text"
//                                                                 className="form-control"
//                                                                 value={contact.Name}
//                                                                 onChange={e => handleContactChange(i, 'Name', e.target.value)}
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="text"
//                                                                 className="form-control"
//                                                                 value={contact.Designation}
//                                                                 onChange={e => handleContactChange(i, 'Designation', e.target.value)}
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="email"
//                                                                 className="form-control"
//                                                                 value={contact.Email}
//                                                                 onChange={e => handleContactChange(i, 'Email', e.target.value)}
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <input
//                                                                 style={{ marginTop: '33px' }}
//                                                                 type="text"
//                                                                 className="form-control"
//                                                                 value={contact.Contact}
//                                                                 onChange={e => handleContactChange(i, 'Contact', e.target.value)}
//                                                             />
//                                                         </td>
//                                                         <td>
//                                                             <input
//                                                                 type="file"
//                                                                 accept="image/*,.pdf"
//                                                                 id={`hidden-file-input-${i}`}
//                                                                 style={{ display: 'none' }}
                                                             
//                                                             />
//                                                             <button
//                                                                 style={{ marginRight: '153px', marginBlock: '24px' }}
//                                                                 type="button"
//                                                                 className="btn btn-outline-primary btn-sm mt-4"
//                                                                 onClick={() => document.getElementById(`hidden-file-input-${i}`)?.click()}
//                                                             >
//                                                                 Signature Upload
//                                                             </button>
                                                          
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>

//                                     </div>
//                                 </div>






//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* --- CARD 2: SECURITY DEPOSIT --- */}
//                 <div className="card mb-5" style={{ borderRadius: '15px', border: '2px solid #FCCE07' }}>
//                     <div className="card-body" style={{ color: 'black' }}>
//                         <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                             <h6 className="mb-0">Security Deposit</h6>
//                         </div>
//                         <div className="row mb-3">
//                             <div className="col-md-6">
//                                 <label className="form-label d-block">Security Type / نوع الضمان المقدم</label>
//                                 <div className="d-flex flex-wrap">
//                                     {['Bank Guarantee', 'Promissory note', 'Letter of Credit', 'Unwilling to provide any Security'].map((type) => (
//                                         <div className="form-check form-check-inline" key={type}>
//                                             <input
//                                                 className="form-check-input"
//                                                 type="radio"
//                                                 name="TypeOfSecurity"
//                                                 id={type.toLowerCase().replace(' ', '')}
//                                                 value={type}
//                                             />
//                                             <label className="form-check-label" htmlFor={type.toLowerCase().replace(' ', '')}>
//                                                 {type} / {type === 'Bank Guarantee' ? 'ضمان بنكي' : type === 'Promissory note' ? 'سند لأمر' : type === 'Letter of Credit' ? 'خطاب اعتماد' : 'غير راغب في تقديم اي ضمان'}
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                             <div className="col-md-6">
//                                 <label className="form-label d-block">Payment Method / طريقة الدفع</label>
//                                 <div className="d-flex flex-wrap">
//                                     {['Bank Transfer', 'Online payment', 'Cheque', 'Certified Cheque', 'Other'].map((method) => (
//                                         <div className="form-check form-check-inline" key={method}>
//                                             <input
//                                                 className="form-check-input"
//                                                 type="radio"
//                                                 name="PaymentMethod"
//                                                 id={method.toLowerCase().replace(' ', '')}
//                                                 value={method}
//                                             />
//                                             <label className="form-check-label" htmlFor={method.toLowerCase().replace(' ', '')}>
//                                                 {method} / {method === 'Bank Transfer' ? 'تحويل مصرفي' : method === 'Online payment' ? 'الدفع عبر الإنترنت' : method === 'Cheque' ? 'شيك' : method === 'Certified Cheque' ? 'شيك معتمد' : 'اخرى'}
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <input
//                                     type="text"
//                                     name="PaymentMethodOther"
//                                     className="form-control mt-2"
//                                     placeholder="Please specify"
//                                 />
//                             </div>
//                         </div>
//                         <div className="row mb-4">
//                             <div className="col-md-6">
//                                 <label htmlFor="creditLimitRequested" className="form-label">
//                                     Credit Limit Requested / الحد الائتماني المطلوب
//                                 </label>
//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     id="creditLimitRequested"
//                                     name="CreditLimitRequested"
//                                 />
//                             </div>
//                             <div className="col-md-6">
//                                 <label htmlFor="paymentTerm" className="form-label">
//                                     Payment Term / فترة الدفع
//                                 </label>
//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     id="paymentTerm"
//                                     name="PaymentTerm"
//                                 />
//                             </div>
//                         </div>

//                         {/* Financial Figures */}
//                         <div className="mb-5">
//                             <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                                 <h6 className="mb-0">Financial Figures / الأرقام المالية ( مليون / ر.س )</h6>
//                             </div>
//                             <div className="table-responsive">
//                                 <table className="table table-bordered text-center">
//                                     <thead className="align-middle table-light">
//                                         <tr>
//                                             <th></th>
//                                             <th>Current Year</th>
//                                             <th>Last Year</th>
//                                             <th>Previous Year</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {[
//                                             'Sales Proceed SAR MN',
//                                             'NIAT (profit after tax) SAR MN',
//                                             'Total Assets SAR MN',
//                                             'Receiveable SAR MN',
//                                             'Total Liabilities SAR MN',
//                                             'Payables SAR MN',
//                                             'Short term Loan SAR MN',
//                                             'Capital SAR MN',
//                                             'Lubricant Consumed (Volume) Litres',
//                                         ].map((metric, index) => (
//                                             <tr key={index}>
//                                                 <td className="text-start align-middle">{metric}</td>
//                                                 <td><input type="text" className="form-control" /></td>
//                                                 <td><input type="text" className="form-control" /></td>
//                                                 <td><input type="text" className="form-control" /></td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Main Project And Contracts */}
//                             <div className="p-1 mb-3" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                                 <h6 className="mb-0">Main Project And Contracts</h6>
//                             </div>
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="AuditorName" className="form-label">
//                                         Auditor Name <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="AuditorName"
//                                         type="text"
//                                         className="form-control"
//                                         name="AuditorName"
//                                         placeholder="Enter auditor name"
//                                     />
//                                 </div>
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="ContractName" className="form-label">
//                                         Contract Name <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         id="ContractName"
//                                         type="text"
//                                         className="form-control"
//                                         name="ContractName"
//                                         placeholder="Enter contract name"
//                                     />
//                                 </div>
//                                 {Array.from({ length: 5 }).map((_, i) => (
//                                     <React.Fragment key={i}>
//                                         <div className="col-md-6 mb-3">
//                                             <label className="form-label">Project Name {i + 1}</label>
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 placeholder={`Project Name ${i + 1}`}
//                                             />
//                                         </div>
//                                         <div className="col-md-6 mb-3">
//                                             <label className="form-label">Project Period {i + 1}</label>
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 placeholder={`Project Period ${i + 1}`}
//                                             />
//                                         </div>
//                                     </React.Fragment>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* BAYAN Terms and Conditions */}
//                         <div className="p-1 mb-4 text-center" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                             <h6 className="mb-0">
//                                 (BAYAN) TERM & CONDITION FOR CUSTOMER DATA COLLECTED / شروط واحكام بخصوص بيانات العميل التي يتم تجميعها
//                             </h6>
//                         </div>
//                         <div className="row mb-4">
//                             <div className="col-md-6">
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     Data supplied, whether personal or otherwise, by Customer and/or which relates to a Customer's account will be held and processed by computer or otherwise by Al Jomaih and Shell Lubricating Oil Company Ltd to operate Customer's account(s); to confirm, update and enhance Al Jomaih and Shell Lubricating Oil Company Ltd's Customer records; for statistical analysis; to establish any identity or otherwise as required under applicable legislation; to assess each Customer's credit status on an ongoing basis; and otherwise as considered necessary or appropriate by Al Jomaih and Shell Lubricating Oil Company Ltd. Al Jomaih and Shell Lubricating Oil Company Limited is also a member of Bayan Credit Beaurue.
//                                 </p>
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     In each case the processing may continue after this Agreement has ended. Alternatively, Customer may be requested to complete or fulfil other checks as may be necessary to satisfy credit assessments, money laundering or fraud detection requirements.
//                                 </p>
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     Al Jomaih and Shell Lubricating Oil Company Ltd may disclose data relating to Customer and/or a Customer's account(s) to: (a) a credit reference agency where it may be accessed by other financial institutions to assist assessment of any application for credit made to Al Jomaih and Shell Lubricating Oil Company Ltd and for debt tracing and fraud prevention;
//                                 </p>
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     I hereby, acknowledge and agree to provide both Al Jomaih and Shell Lubricating Oil Company Ltd and Bayan Credit Information Company (Bayan) with any information required by either of them, in preparation for obtaining any of the services and products issued by Bayan, and/or entering into any of its programs, and/or using any of the relevant services provided Bayan including my consent on the establishment of my credit record. I also authorize said entities jointly and/or severally to collect and keep all necessary data pertaining to me (which belongs to the entity and its owners if the customer was an entity), and to view my financial and credit data/information. I also acknowledge and confirm my approval on allowing Bayan to exchange and distribute my information by and between all relevant parties, including current and potential Bayan members, under special agreements to be signed with them to regulate the exchange of information.
//                                 </p>
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     (b) to any guarantor or person providing security in relation to Customer's obligations under this Agreement; (c) as required or permitted by law or any regulatory authority; (d) as otherwise considered necessary or appropriate by Al Jomaih and Shell Lubricating Oil Company Ltd.
//                                 </p>
//                             </div>
//                             <div className="col-md-6 text-end">
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     سيتم الاحتفاظ ومعالجة البيانات المقدمة من العميل وا أو تلك المتعلقة بحسابه سواء كانت شخصية او خلافها بواسطة الحاسوب او بواسطة شركة الجميح وشل لزيوت التشحيم المحدودة، وهي البيانات المتعلقه بحسابه \ حساباته للتأكيد وللتحديث ولتعزيز وتحسين سجلات العميل لدى شركة الجميح وشل لزيوت التشحيم المحدودة بغرض اجراء تحليل احصائي، لإنشاء اية هوية او خلافه حسب الطلب والانظمة السارية وللتقييم المستمر للوضع الائتماني لكل عميل. وخلاف ذلك حسب ما تعتبره شركة الجميح وشل لزيوت التشحيم المحدودة ضروريا أو وقد تستمر معالجة ومناولة هذه البيانات في كل حالة لما بعد انتهاء هذا الاتفاق. وقد يطلب بدلا من العميل اتمام او عمل شيكات أخرى حسب ما قد تتطلبه ضرورة متطلبات تلبية تقييم الائتمان، غسيل الأموال اوكشف الاحتيال.
//                                 </p>
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     يحق لشركة الجميح وشل لزيوت التشحيم المحدودة الافصاح عن هذه البيانات المتعلقة بالعميل و ا أو بحساباته الى : (أ ) وكالة مرجعية الائتمان حيث يمكن ان تصل اليها مؤسسات مالية أخرى للمساعدة في تقييم طلبات الائتمان المقدمة لشركة الجميح وشل لزيوت التشحيم المحدودة ولمتابعة الديون ومنع الاحتيال
//                                 </p>
//                                 <p style={{ fontSize: '0.8rem' }}>
//                                     وبهذا أقر وأوافق على تزويد كلا من شركة الجميح وشل لزيوت التشحيم المحدودة وشركة بيان للمعلومات الائتمانية ( بيان ) باية معلومات مطلوبة منهما، تحضيرا لأية خدمات أو منتجات صادرة بواسطة بيان و ١ أو ادخالها في اي من برامجها، و ١ أو استخدام أي من الخدمات المتعلقة بذلك والتي تقدمها بيان شاملة موافقتي على عمل سجل ائتماني لي . كما أفوض أيضا الشركات المذكورة متضامنين و ١ أو منفردين بجمع وحفظ جميع البيانات الضرورية المتعلقة بي ) والتي تخص الشركة / المؤسسة ومالكيها اذا كان العميل هو هذه الشركة \ المؤسسة ) والاطلاع على بياناتي ومعلوماتي المالية المتعلقة بالإئتمان. كما اأقر ايضا وأوكد موافقتي على السماح لبيان لتبادل وتوزيع معلوماتي بواسطة وبين جميع الاطراف التي لها علاقة بذلك، شاملة اعضاء بيان الحاليين والمحتملين بموجب الاتفاقيات خاصة تنظم تبادل المعلومات . ( ب ) الى أي ضامن او شخص يقدم ضمان على التزامات العميل القائمة بموجب هذا الاتفاق ) ج ) حسب الطلب او المسموح به قانونا او اية سلطة 1 منظمة . ( د ) او خلاف ذلك ومما يُعتبر ضروريا أو مناسبا لشركة الجميح وشل لزيوت التشحيم المحدودة.
//                                 </p>
//                             </div>
//                         </div>

//                         {/* SIMAH Terms and Conditions */}
//                         <div className="p-1 my-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                             <h6 className="mb-0">(SIMAH) Terms and Conditions for Customer Data</h6>
//                         </div>
//                         <div className="d-flex flex-wrap">
//                             {['Individual', 'Commercial'].map((type) => (
//                                 <div className="form-check form-check-inline me-4" key={type}>
//                                     <input
//                                         className="form-check-input"
//                                         type="radio"
//                                         name="customerdata"
//                                         id={`customerdata${type}`}
//                                         value={type}
//                                     />
//                                     <label className="form-check-label" htmlFor={`customerdata${type}`}>
//                                         {type}
//                                     </label>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Individual Terms and Conditions */}
//                         <div className="mt-3 p-3">
//                             <h6>Individual Terms and Conditions</h6>
//                             <div className="mt-4 p-3 border bg-light" style={{ lineHeight: '1.8' }}>
//                                 <div className="row mb-3">
//                                     <div className="col-md-6">
//                                         <strong>
//                                             I, the undersigned person acknowledge, that my personal data and information are true, accurate and complete, and I acknowledge my approval to authorize (AlJomaih & Shell Lubricating Oil Co. Ltd.) to establish and/or create and/or inquire and/or issue and/or review my credit record in Saudi Credit Bureau (SIMAH) and disclosing my previous, current and future credit information and data and sharing them with all current and potential members of the Saudi Credit Bureau (SIMAH) or any entity who’s approved by the Saudi Central Bank
//                                         </strong>
//                                     </div>
//                                     <div className="col-md-6" dir="rtl" lang="ar">
//                                         <strong>
//                                             أقر انا الموقع أدناه أن بياناتي ومعلوماتي الشخصية صحيحة ودقيقة وكاملة، وعليه أقر بموافقتي على تفويض (شركة الجميح وشل لزيوت التشحيم المحدودة) في تأسيس و/أو إنشاء و/أو الاستعلام و /أو إصدار و/أو مراجعة سجلي الائتماني لدى الشركة السعودية للمعلومات الائتمانية (سمة) والافصاح عن معلوماتي وبياناتي الائتمانية السابقة والحالية والمستقبلية ومشاركتها مع كافة أعضاء الشركة السعودية للمعلومات الائتمانية (سمة) الحاليين والمحتملين أو لأي جهة يقرها البنك المركزي السعودي
//                                         </strong>
//                                     </div>
//                                 </div>
//                                 <div className="row">
//                                     <div className="col-md-6">
//                                         <p><strong>
//                                             We read and understand the above customer consent and we confirm that we fully understand how to use it and the importance of having the approval from the authorized person before the inquiry.
//                                         </strong></p>
//                                     </div>
//                                     <div className="col-md-6" dir="rtl" lang="ar">
//                                         <strong>تم قرأءة اقرار العميل أعلاه، ونؤكد على فهم ألية تطبيق الاقرار وأهمية أخذ موافقة العميل من الشخص المخول بالتوقيع قبل ، وعليه نوقع: الاستعلام</strong>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Commercial Terms and Conditions */}
//                         <div className="mt-3 p-3">
//                             <h6>Commercial Terms and Conditions</h6>
//                             <div className="mt-4 p-3 border bg-light" style={{ lineHeight: '1.8' }}>
//                                 <div className="row mb-3">
//                                     <div className="col-md-6">
//                                         <strong>
//                                             I, the undersigned person acknowledge, on behalf of (the name of the company or institution) that the data and information of (the name of the company or institution) are true, accurate and complete, and I also acknowledge that I agree on behalf of (the name of the company or institution) to authorize (AlJomaih & Shell Lubricating Oil Co. Ltd.) to establish and/or create and/or inquire and/or issue and/or review the credit record of (the name of the company or institution) in Saudi Credit Bureau (SIMAH) and disclose its previous, current and future credit information and data and sharing them with all current and potential members of the Saudi Credit Bureau (SIMAH) or any entity who’s approved by the Central Bank. I also agree, on behalf of the (company or institution) to inquire about commercial data, information, financial statements, and other relevant information from authorized sources, to disclose and exchange them with all current and/or potential members of credit information companies.
//                                         </strong>
//                                     </div>
//                                     <div className="col-md-6" dir="rtl" lang="ar">
//                                         <strong>
//                                             أقر انا الموقع أدناه بالنيابة عن (اسم الشركة أو المؤسسة) أن بيانات ومعلومات (اسم الشركة أو المؤسسة) صحيحة ودقيقة وكاملة، كما أقر بالموافقة بالنيابة عن (اسم الشركة أو المؤسسة) على تفويض (شركة الجميح وشل لزيوت التشحيم المحدودة) في تأسيس و/أو إنشاء و/أو الاستعلام و/أو إصدار و/أو مراجعة السجل الائتماني لـ (اسم الشركة أو المؤسسة) لدى الشركة السعودية للمعلومات الائتمانية (سمة) والافصاح عن معلوماتها وبياناتها الائتمانية السابقة والحالية والمستقبلية ومشاركتها مع كافة أعضاء الشركة السعودية للمعلومات الائتمانية (سمة) الحاليين والمحتملين أو لأي جهة يقرّها البنك المركزي السعودي. كما أوافق بالنيابة عن (الشركة أو المؤسسة) عن الاستعلام عن البيانات والمعلومات التجارية والقوائم المالية وغيرها من المعلومات ذات العلاقة من المصادر المصرّحة والافصاح عنها وتبادلها مع كافة أعضاء شركات المعلومات الائتمانية الحاليين و/أو/ المحتملين.
//                                         </strong>
//                                     </div>
//                                 </div>
//                                 <div className="row">
//                                     <div className="col-md-6">
//                                         <p><strong>
//                                             We read and understand the above customer consent and we confirm that we fully understand how to use it and the importance of having the approval from the authorized person before the inquiry.
//                                         </strong></p>
//                                     </div>
//                                     <div className="col-md-6" dir="rtl" lang="ar">
//                                         <p><strong>تم قرأءة اقرار العميل أعلاه، ونؤكد على فهم ألية تطبيق الاقرار وأهمية أخذ موافقة العميل من الشخص المخول بالتوقيع قبل الاستعلام، وعليه نوقع:</strong></p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <p className="fw-bold">
//                             I hereby confirm that the information provided above is correct and to the best of my Knowledge, and I am authorized to sign this declaration on behalf of the company. / بهذا أقر بأن المعلومات المقدمة أعلاه صحيحة على حد علمي الجيد ، وأنا المفوض بالتوقيع على نموذج الطلب هذا بالنيابة عن الشركة.
//                         </p>
//                         <div className="row mt-4">
//                             <div className="col-md-6">
//                                 <div className="mb-3">
//                                     <label htmlFor="termsCompanyName" className="form-label">
//                                         Company Name / اسم الشركة
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="termsCompanyName"
//                                         name="termsCompanyName"
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="termsStampFile" className="form-label">
//                                         Company Stamp / الختم اسم الشركة
//                                     </label>
//                                     <br />
//                                     <input
//                                         type="file"
//                                         accept="image/*,.pdf"
//                                         id="termsStampFile"
//                                         style={{ display: 'none' }}
//                                     />
//                                     <button
//                                         type="button"
//                                         className="btn btn-outline-primary btn-sm mt-2"
//                                     >
//                                         Upload Company Stamp
//                                     </button>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="termsNameOfSponsor" className="form-label">
//                                         Name of Sponsor / اسم الكفيل
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="termsNameOfSponsor"
//                                         name="termsNameOfSponsor"
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="termsSignatureFile" className="form-label">
//                                         Sponsor Signature / التوقيع اسم الكفيل
//                                     </label>
//                                     <br />
//                                     <input
//                                         type="file"
//                                         accept="image/*,.pdf"
//                                         id="termsSignatureFile"
//                                         style={{ display: 'none' }}
//                                     />
//                                     <button
//                                         type="button"
//                                         className="btn btn-outline-primary btn-sm mt-2"
//                                     >
//                                         Upload Sponsor Signature
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="col-md-6">
//                                 <div className="mb-3">
//                                     <label htmlFor="termsAuthorizedSignatory" className="form-label">
//                                         Authorized Signatory / اسم المفوض
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="termsAuthorizedSignatory"
//                                         name="termsAuthorizedSignatory"
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="termsSignature2File" className="form-label">
//                                         Authorized Signature / التوقيع اسم المفوض
//                                     </label>
//                                     <br />
//                                     <input
//                                         type="file"
//                                         accept="image/*,.pdf"
//                                         id="termsSignature2File"
//                                         style={{ display: 'none' }}
//                                     />
//                                     <button
//                                         type="button"
//                                         className="btn btn-outline-primary btn-sm mt-2"
//                                     >
//                                         Upload Authorized Signature
//                                     </button>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="termsKAMName" className="form-label">
//                                         KAM Name / اسم مدير الحساب
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="termsKAMName"
//                                         name="termsKAMName"
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="termsSignature3File" className="form-label">
//                                         KAM Signature / التوقيع اسم مدير الحساب
//                                     </label>
//                                     <br />
//                                     <input
//                                         type="file"
//                                         accept="image/*,.pdf"
//                                         id="termsSignature3File"
//                                         style={{ display: 'none' }}
//                                     />
//                                     <button
//                                         type="button"
//                                         className="btn btn-outline-primary btn-sm mt-2"
//                                     >
//                                         Upload KAM Signature
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Required Documents */}
//                         <div className="p-1 my-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
//                             <h6 className="mb-0">Required Documents / الاوراق المطلوبة</h6>
//                         </div>
//                         <div className="row">
//                             {[0, 1].map((colIndex) => (
//                                 <div className="col-md-6" key={colIndex}>
//                                     {[
//                                         { id: 'termsAuthSignatoryId', value: 'Authorized Signatory ID', label: 'Authorized Signatory ID / هوية الشخص المفوض بالتوقيع' },
//                                         { id: 'termsMainCommCert', value: 'Main Commercial Reg. Certificate', label: 'Main Commercial Reg. Certificate / صورة السجل الرئيسي ساري المفعول' },
//                                         { id: 'termsVatCert', value: 'VAT registration Certificate', label: 'VAT registration Certificate / صورة من شهادة ضريبة القيمة المضافة' },
//                                         { id: 'termsBankStmt', value: 'Official Bank Statement (last 3 months)', label: 'Official Bank Statement (last 3 months) / كشف حساب بنكي رسمي لآخر ثلاث أشهر' },
//                                         { id: 'termsIncorpContract', value: 'Incorporation Contract for the company', label: 'Incorporation Contract for the company / عقد التأسيس' },
//                                         { id: 'termsFinancialStmt', value: 'Last Audited Financial Statement', label: 'Last Audited Financial Statement / آخر ميزانية مدققة' },
//                                         { id: 'termsPowerOfAttorney', value: 'Power of Attorney', label: 'Power of Attorney if Any / عقد التوكيل' },
//                                         { id: 'termsSponsorId', value: 'Sponsor ID', label: 'Sponsor ID / هوية الكفيل' },
//                                     ].slice(colIndex * 4, (colIndex + 1) * 4).map((doc) => (
//                                         <div className="mb-3" key={doc.id}>
//                                             <div className="form-check">
//                                                 <input
//                                                     className="form-check-input"
//                                                     type="checkbox"
//                                                     value={doc.value}
//                                                     id={doc.id}
//                                                 />
//                                                 <label className="form-check-label" htmlFor={doc.id}>
//                                                     {doc.label}
//                                                 </label>
//                                             </div>
//                                             <input
//                                                 type="file"
//                                                 id={`file-${doc.value}`}
//                                                 style={{ display: 'none' }}
//                                                 multiple
//                                             />
//                                             <label
//                                                 htmlFor={`file-${doc.value}`}
//                                                 className="btn btn-outline-primary btn-sm mt-1"
//                                                 style={{ cursor: 'pointer' }}
//                                             >
//                                                 Upload File
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Submit and Exit Buttons */}
//                 <div className="text-center pb-3">
//                     <button
//                         type="submit"
//                         className="btn"
//                         style={{
//                             backgroundColor: '#ffc107',
//                             color: 'black',
//                             border: 'none',
//                             borderRadius: '5px',
//                             padding: '8px 16px',
//                             fontSize: '1rem',
//                             cursor: 'pointer',
//                             transition: 'background-color 0.3s ease',
//                         }}
//                     >
//                         Submit
//                     </button>
//                     {/* <button
//                         type="button"
//                         className="btn btn-secondary ms-2"
//                         style={{
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '5px',
//                             padding: '8px 30px',
//                             fontSize: '1rem',
//                             cursor: 'pointer',
//                             transition: 'background-color 0.3s ease',
//                         }}
//                     >
//                         Exit
//                     </button> */}
//                 </div>
//             </form>

//             {/* Popup Modal for Loading */}
//             {/* Loading Modal */}
//             {loading && (
//                 <div
//                     className="modal fade show"
//                     style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         backgroundColor: 'rgba(0,0,0,0.5)',
//                         position: 'fixed',
//                         inset: 0,
//                         zIndex: 1050,
//                     }}
//                 >
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content text-center p-4">
//                             <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
//                                 <span className="visually-hidden">Loading...</span>
//                             </div>
//                             <h5>Submitting your form...</h5>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Success / Error Message Modal */}
//             {statusMessage && !loading && (
//                 <div
//                     className="modal fade show"
//                     style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         backgroundColor: 'rgba(0,0,0,0.5)',
//                         position: 'fixed',
//                         inset: 0,
//                         zIndex: 1050,
//                     }}
//                 >
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content text-center p-4">
//                             <h5>{statusMessage}</h5>
//                             <button
//                                 className="btn btn-primary mt-3"
//                                 onClick={() => setStatusMessage(null)}
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };

// export default CreditCustomers;