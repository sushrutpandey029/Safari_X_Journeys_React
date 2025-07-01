import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faUser,
  faLock,
  faRightFromBracket,
  faEye,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FaEye } from "react-icons/fa6";

function Booking() {
  return (
    <table class="table table-hover table-bordered ">
                <thead>
                  <tr>
                    <th scope="col">ORDER ID</th>
                    <th scope="col">BOOKING STATUS</th>
                    <th scope="col">VIEW</th>
                    <th scope="col">CANCEL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>#12345</th>
                    <td className="text-success">Confirm</td>
                    <td>
                      <button type="button" class="btn btn-success btn-sm">
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn btn-danger btn-sm">
                        <FontAwesomeIcon icon={faXmark} /> Cancel
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th>#23455</th>
                    <td className="text-danger">Pending</td>
                    <td>
                      <button type="button" class="btn btn-success btn-sm">
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn btn-danger btn-sm">
                        <FontAwesomeIcon icon={faXmark} /> Cancel
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
  )
}

export default Booking